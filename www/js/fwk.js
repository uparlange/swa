"use strict";

(function (app) {
    app.Fwk = {
        manager: {
            RouterManager: {
                _router: null,
                _routes: {
                    login: null,
                    default: null,
                    secureDefault: null,
                    secures: {}
                },
                _requestedRouteBeforeLogin: null,
                initialize: function (routes) {
                    this._analyzeRoutes(routes);
                    this._router = new VueRouter({
                        routes: routes
                    });
                    this._router.beforeEach((to, from, next) => {
                        if (this._routes.secures[to.fullPath] && !app.Fwk.manager.SecurityManager.isConnected()) {
                            this._requestedRouteBeforeLogin = to.fullPath;
                            next(this._routes.login);
                        } else {
                            next();
                        }
                    });
                    this._router.afterEach((to, from) => {
                        app.Fwk.manager.EventBus.emit("FWK_ROUTE_CHANGED", {
                            from: from.fullPath,
                            to: to.fullPath
                        });
                    });
                    app.Fwk.manager.EventBus.on("FWK_USER_SIGNED_IN", (user) => {
                        if (this._requestedRouteBeforeLogin != null) {
                            this.navigate(this._requestedRouteBeforeLogin);
                            this._requestedRouteBeforeLogin = null;
                        } else {
                            this.navigate(this._routes.secureDefault);
                        }
                    });
                    app.Fwk.manager.EventBus.on("FWK_USER_SIGNED_OUT", () => {
                        this.navigate(this._routes.default);
                    });
                    app.Fwk.manager.EventBus.on("FWK_USER_REGISTERED", (user) => {
                        this.navigate(this._routes.login);
                    });
                    app.Fwk.manager.EventBus.on("FWK_SESSION_TIMED_OUT", () => {
                        this.navigate(this._routes.login);
                    });
                    return this._router;
                },
                getCurrentRoute: function () {
                    return this._router.currentRoute.fullPath;
                },
                navigate: function (location, onComplete, onAbort) {
                    this._router.push(location);
                },
                _analyzeRoutes: function (routes, basePath) {
                    routes.forEach((element) => {
                        const path = (basePath ? (basePath + "/") : "") + element.path;
                        if (element.secure) {
                            this._routes.secures[path] = true;
                            if (element.default) {
                                this._routes.secureDefault = path;
                            }
                        } else {
                            if (element.login) {
                                this._routes.login = path;
                            } else if (element.default) {
                                this._routes.default = path;
                            }
                        }
                        if (element.children) {
                            this._analyzeRoutes(element.children, element.path);
                        }
                    });
                }
            },
            I18nManager: {
                _locale: null,
                _i18n: new VueI18n(),
                initialize: function (locale) {
                    this.setLocale(locale);
                    return this._i18n;
                },
                setLocale: function (locale) {
                    if (this._locale !== locale) {
                        this._locale = locale;
                        if (this._i18n.messages[this._locale] !== undefined) {
                            this._setLocale(this._locale);
                        } else {
                            this._initLocale(this._locale).then(() => {
                                this._setLocale(this._locale);
                            });
                        }
                    }
                },
                getLocale: function () {
                    return this._locale;
                },
                getLabel: function (params) {
                    params = params || {};
                    return this._i18n.t(params.key, params.locale, params.values);
                },
                _setLocale: function (locale) {
                    this._i18n.locale = locale;
                    document.querySelector("html").setAttribute("lang", locale);
                },
                _initLocale: function (locale) {
                    return new Promise((resolve, reject) => {
                        const localeFileUrl = "data/i18n/" + locale + ".json";
                        const request = Vue.http.get(localeFileUrl);
                        app.Fwk.util.HttpUtils.callService(request).then((response) => {
                            this._i18n.setLocaleMessage(locale, response.body);
                            resolve();
                        });
                    });
                }
            },
            SecurityManager: {
                register: function (login, password) {
                    return new Promise((resolve, reject) => {
                        const request = Vue.http.post("/services/register", {
                            login: login,
                            password: password
                        });
                        app.Fwk.util.HttpUtils.callService(request).then((response) => {
                            app.Fwk.manager.EventBus.emit("FWK_USER_REGISTERED");
                        }, (response) => {
                            reject(response);
                        });
                    });
                },
                login: function (login, password) {
                    return new Promise((resolve, reject) => {
                        const request = Vue.http.post("/services/login", {
                            login: login,
                            password: password
                        });
                        app.Fwk.util.HttpUtils.callService(request).then((response) => {
                            this._setToken(response.body.data.token);
                            app.Fwk.manager.EventBus.emit("FWK_USER_SIGNED_IN", response.body.data.user);
                        }, (response) => {
                            reject(response);
                        });
                    });
                },
                logout: function () {
                    this._setToken(null);
                    app.Fwk.manager.EventBus.emit("FWK_USER_SIGNED_OUT");
                },
                sessionTimedOut: function () {
                    this._setToken(null);
                    app.Fwk.manager.EventBus.emit("FWK_SESSION_TIMED_OUT");
                },
                isConnected: function () {
                    return (Vue.http.headers.common["Authorization"] != null);
                },
                _setToken: function (token) {
                    if (!token) {
                        delete Vue.http.headers.common["Authorization"];
                    } else {
                        Vue.http.headers.common["Authorization"] = "Bearer " + token;
                    }
                }
            },
            EventBus: {
                _vue: new Vue(),
                emit: function (eventName, data) {
                    this._vue.$emit(eventName, data);
                },
                on: function (eventName, callback) {
                    this._vue.$on(eventName, callback);
                },
                off: function (eventName, callback) {
                    this._vue.$off(eventName, callback);
                }
            },
            ComponentManager: {
                _templateCache: {},
                _componentCache: {},
                bootstrap: function (params) {
                    // load js
                    this._loadJS(this._getComponentUrl(params)).then(() => {
                        const componentDescription = this._getComponentDescription(params.id);
                        componentDescription.i18n = app.Fwk.manager.I18nManager.initialize(params.locale || "en");
                        componentDescription.router = app.Fwk.manager.RouterManager.initialize(params.routes || []);
                        // load html
                        const request = Vue.http.get(this._getTemplateUrl(params));
                        app.Fwk.util.HttpUtils.callService(request).then((response) => {
                            document.getElementById(params.id).innerHTML = response.bodyText;
                            // bootstrap
                            const vue = new Vue(componentDescription);
                            vue.$mount("#" + params.id);
                        });
                    });
                },
                register: function (id, description) {
                    if (!description.methods) {
                        description.methods = {};
                    }
                    description.methods.fwkLogin = function (login, password) {
                        return app.Fwk.manager.SecurityManager.login(login, password);
                    };
                    description.methods.fwkRegister = function (login, password) {
                        return app.Fwk.manager.SecurityManager.register(login, password);
                    };
                    description.methods.fwkLogout = function () {
                        return app.Fwk.manager.SecurityManager.logout();
                    };
                    description.methods.fwkCallService = function (request) {
                        return app.Fwk.util.HttpUtils.callService(request);
                    };
                    description.methods.fwkGetEventBus = function () {
                        return app.Fwk.manager.EventBus;
                    };
                    description.methods.fwkGetLabel = function (params) {
                        return app.Fwk.manager.I18nManager.getLabel(params);
                    };
                    description.methods.fwkGetCurrentLocale = function () {
                        return app.Fwk.manager.I18nManager.getLocale();
                    };
                    description.methods.fwkGetCurrentRoute = function () {
                        return app.Fwk.manager.RouterManager.getCurrentRoute();
                    };
                    this._componentCache[id] = description;
                },
                define: function (params) {
                    return () => {
                        return new Promise((resolve, reject) => {
                            // load js
                            this._loadJS(this._getComponentUrl(params)).then(() => {
                                const componentDescription = this._getComponentDescription(params.id);
                                // load html (with cache managment for component sharing same template)
                                const templateUrl = this._getTemplateUrl(params);
                                const templateDescription = this._getTemplateDescription(templateUrl);
                                if (templateDescription) {
                                    componentDescription.template = templateDescription;
                                    resolve(componentDescription);
                                } else {
                                    const request = Vue.http.get(templateUrl);
                                    app.Fwk.util.HttpUtils.callService(request).then((response) => {
                                        componentDescription.template = this._setTemplateDescription(templateUrl, response.bodyText);
                                        resolve(componentDescription);
                                    });
                                }
                            })
                        });
                    }
                },
                _getComponentDescription: function (id) {
                    return this._componentCache[id];
                },
                _setTemplateDescription: function (url, description) {
                    this._templateCache[url] = description;
                    return description;
                },
                _getTemplateDescription: function (url) {
                    return this._templateCache[url];
                },
                _getComponentUrl: function (params) {
                    return params.componentUrl || ("js/" + app.Fwk.util.StringUtils.dasherize(params.id) + ".js");
                },
                _getTemplateUrl: function (params) {
                    return params.templateUrl || ("html/" + app.Fwk.util.StringUtils.dasherize(params.id) + ".html");
                },
                _loadJS: function (url) {
                    return new Promise((resolve, reject) => {
                        app.Fwk.manager.EventBus.emit("FWK_RESOURCE_LOADING_START");
                        const script = document.createElement("script");
                        script.onload = () => {
                            app.Fwk.manager.EventBus.emit("FWK_RESOURCE_LOADING_STOP");
                            resolve();
                        };
                        document.head.appendChild(script);
                        script.src = url;
                    });

                }
            }
        },
        util: {
            StringUtils: {
                dasherize: function (str) {
                    return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
                }
            },
            HttpUtils: {
                callService: function (request) {
                    return new Promise((resolve, reject) => {
                        app.Fwk.manager.EventBus.emit("FWK_RESOURCE_LOADING_START");
                        request.then((response) => {
                            app.Fwk.manager.EventBus.emit("FWK_RESOURCE_LOADING_STOP");
                            resolve(response);
                        }, (response) => {
                            app.Fwk.manager.EventBus.emit("FWK_RESOURCE_LOADING_STOP");
                            if (app.Fwk.manager.SecurityManager.isConnected() && response.status === 401) {
                                app.Fwk.manager.SecurityManager.sessionTimedOut();
                            } else {
                                reject(response);
                            }
                        });
                    });
                }
            }
        }
    };
}(window.app || (window.app = {})));