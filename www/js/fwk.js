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
                init: function () {
                    app.fwkGetCurrentRoute = () => {
                        return this._getCurrentRoute();
                    };
                },
                initForApplication: function (routes) {
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
                        app.fwkGetEventBus().emit("FWK_ROUTE_CHANGED", {
                            from: from.fullPath,
                            to: to.fullPath
                        });
                    });
                    app.fwkGetEventBus().on("FWK_USER_SIGNED_IN", (user) => {
                        if (this._requestedRouteBeforeLogin != null) {
                            this.navigate(this._requestedRouteBeforeLogin);
                            this._requestedRouteBeforeLogin = null;
                        } else {
                            this.navigate(this._routes.secureDefault);
                        }
                    });
                    app.fwkGetEventBus().on("FWK_USER_SIGNED_OUT", () => {
                        this.navigate(this._routes.default);
                    });
                    app.fwkGetEventBus().on("FWK_USER_REGISTERED", (user) => {
                        this.navigate(this._routes.login);
                    });
                    app.fwkGetEventBus().on("FWK_SESSION_TIMED_OUT", () => {
                        this.navigate(this._routes.login);
                    });
                    return this._router;
                },
                navigate: function (location, onComplete, onAbort) {
                    this._router.push(location);
                },
                _getCurrentRoute: function () {
                    return this._router.currentRoute.fullPath;
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
                init: function () {
                    app.fwkGetLabel = (params) => {
                        return this._getLabel(params);
                    };
                    app.fwkGetCurrentLocale = () => {
                        return this._getLocale();
                    };
                },
                initForApplication: function (locale) {
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
                _getLocale: function () {
                    return this._locale;
                },
                _getLabel: function (params) {
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
                        app.fwkCallService(request).then((response) => {
                            this._i18n.setLocaleMessage(locale, response.body);
                            resolve();
                        });
                    });
                }
            },
            SecurityManager: {
                init: function () {
                    app.fwkLogin = (login, password) => {
                        return this._login(login, password);
                    };
                    app.fwkRegister = (login, password) => {
                        return this._register(login, password);
                    };
                    app.fwkLogout = () => {
                        return this._logout();
                    };
                },
                sessionTimedOut: function () {
                    this._setToken(null);
                    app.fwkGetEventBus().emit("FWK_SESSION_TIMED_OUT");
                },
                isConnected: function () {
                    return (Vue.http.headers.common["Authorization"] != null);
                },
                _register: function (login, password) {
                    return new Promise((resolve, reject) => {
                        const request = Vue.http.post("/services/register", {
                            login: login,
                            password: password
                        });
                        app.fwkCallService(request).then((response) => {
                            app.fwkGetEventBus().emit("FWK_USER_REGISTERED");
                        }, (response) => {
                            reject(response);
                        });
                    });
                },
                _login: function (login, password) {
                    return new Promise((resolve, reject) => {
                        const request = Vue.http.post("/services/login", {
                            login: login,
                            password: password
                        });
                        app.fwkCallService(request).then((response) => {
                            this._setToken(response.body.data.token);
                            app.fwkGetEventBus().emit("FWK_USER_SIGNED_IN", response.body.data.user);
                        }, (response) => {
                            reject(response);
                        });
                    });
                },
                _logout: function () {
                    this._setToken(null);
                    app.fwkGetEventBus().emit("FWK_USER_SIGNED_OUT");
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
                init: function () {
                    app.fwkGetEventBus = () => {
                        return this;
                    };
                },
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
                init: function () {
                    app.fwkBootstrapComponent = (params) => {
                        this._fwkBootstrapComponent(params);
                    };
                    app.fwkRegisterRouteComponent = (id, description) => {
                        this._fwkRegisterRouteComponent(id, description);
                    };
                    app.fwkDefineRouteComponent = (params) => {
                        return this._fwkDefineRouteComponent(params);
                    };
                },
                _fwkDefineRouteComponent: function (params) {
                    return () => {
                        return new Promise((resolve, reject) => {
                            // load js
                            app.fwkLoadJs(this._getComponentUrl(params)).then(() => {
                                const componentDescription = this._getComponentDescription(params.id);
                                // load html (with cache managment for component sharing same template)
                                const templateUrl = this._getTemplateUrl(params);
                                const templateDescription = this._getTemplateDescription(templateUrl);
                                if (templateDescription) {
                                    componentDescription.template = templateDescription;
                                    resolve(componentDescription);
                                } else {
                                    const request = Vue.http.get(templateUrl);
                                    app.fwkCallService(request).then((response) => {
                                        componentDescription.template = this._setTemplateDescription(templateUrl, response.bodyText);
                                        resolve(componentDescription);
                                    });
                                }
                            })
                        });
                    }
                },
                _fwkRegisterRouteComponent: function (id, description) {
                    this._componentCache[id] = description;
                },
                _fwkBootstrapComponent: function (params) {
                    // load js
                    app.fwkLoadJs(this._getComponentUrl(params)).then(() => {
                        const componentDescription = this._getComponentDescription(params.id);
                        componentDescription.i18n = app.Fwk.manager.I18nManager.initForApplication(params.locale || "en");
                        componentDescription.router = app.Fwk.manager.RouterManager.initForApplication(params.routes || []);
                        // load html
                        const request = Vue.http.get(this._getTemplateUrl(params));
                        app.fwkCallService(request).then((response) => {
                            document.getElementById(params.id).innerHTML = response.bodyText;
                            // bootstrap
                            const vue = new Vue(componentDescription);
                            vue.$mount("#" + params.id);
                        });
                    });
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
                }
            },
            ResourceManager: {
                init: function () {
                    app.fwkCallService = (request) => {
                        return this._callService(request);
                    };
                    app.fwkLoadJs = (url) => {
                        return this._loadJs(url);
                    };
                },
                _loadJs: function (url) {
                    return new Promise((resolve, reject) => {
                        app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_START");
                        const script = document.createElement("script");
                        script.onload = () => {
                            app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_STOP");
                            resolve();
                        };
                        document.head.appendChild(script);
                        script.src = url;
                    });

                },
                _callService: function (request) {
                    return new Promise((resolve, reject) => {
                        app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_START");
                        request.then((response) => {
                            app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_STOP");
                            resolve(response);
                        }, (response) => {
                            app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_STOP");
                            if (app.Fwk.manager.SecurityManager.isConnected() && response.status === 401) {
                                app.Fwk.manager.SecurityManager.sessionTimedOut();
                            } else {
                                reject(response);
                            }
                        });
                    });
                }
            }
        },
        util: {
            StringUtils: {
                dasherize: function (str) {
                    return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
                }
            }
        }
    };
    for (var manager in app.Fwk.manager) {
        app.Fwk.manager[manager].init();
    }
}(window.app || (window.app = {})));