"use strict";

(function (app) {
    const Fwk = {
        manager: {
            RouterManager: {
                _router: null,
                _routes: {
                    login: null,
                    default: null,
                    secureDefault: null,
                    secures: {}
                },
                _scrollPositions: {},
                _requestedRouteBeforeLogin: null,
                init: function () {
                    app.fwkGetCurrentRoute = () => {
                        return this._getCurrentRoute();
                    };
                },
                initForApplication: function (routes) {
                    this._analyzeRoutes(routes);
                    this._router = new VueRouter({
                        routes: routes,
                        scrollBehavior: (to, from, savedPosition) => {
                            // restore scroll position
                            return { x: 0, y: (this._scrollPositions[to.fullPath] || 0) };
                        }
                    });
                    this._router.beforeEach((to, from, next) => {
                        // save scroll position
                        this._scrollPositions[from.fullPath] = window.pageYOffset;
                        // check if route secured
                        if (this._routes.secures[to.fullPath] && !Fwk.manager.SecurityManager.isConnected()) {
                            this._requestedRouteBeforeLogin = to.fullPath;
                            next(this._routes.login);
                        } else {
                            next();
                        }
                    });
                    this._router.afterEach((to, from) => {
                        // dispatch event
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
                    app.fwkUserLogin = (login, password) => {
                        return this._login(login, password);
                    };
                    app.fwkUserRegister = (login, password) => {
                        return this._register(login, password);
                    };
                    app.fwkUserLogout = () => {
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
                _directiveCache: {},
                init: function () {
                    // components
                    app.fwkDefineComponent = (params, description) => {
                        this._defineComponent(params.id, description);
                    };
                    app.fwkUseComponent = (params) => {
                        Vue.component(Fwk.util.StringUtils.dasherize(params.id), this._useComponent(params));
                    };
                    // directives
                    app.fwkDefineDirective = (params, description) => {
                        if (this._directiveCache[params.id]) {
                            console.warn("FWK : Directive '" + params.id + "' already registered... definition crushed !");
                        }
                        Vue.directive(Fwk.util.StringUtils.dasherize(params.id), description);
                        this._directiveCache[params.id] = true;
                    };
                    // route components
                    app.fwkUseRouteComponent = (params) => {
                        return this._useComponent(params);
                    };
                    // application
                    app.fwkBootstrapComponent = (params) => {
                        this._bootstrapComponent(params);
                    };
                },
                _loadComponent: function (params) {
                    return new Promise((resolve, reject) => {
                        let componentDescription = this._getComponentDescription(params.id);
                        if (componentDescription) {
                            resolve(componentDescription);
                        } else {
                            const componentUrl = this._getComponentUrl(params);
                            app.fwkLoadJs(componentUrl).then(() => {
                                componentDescription = this._getComponentDescription(params.id);
                                resolve(componentDescription);
                            });
                        }
                    });
                },
                _loadTemplate: function (params) {
                    return new Promise((resolve, reject) => {
                        const templateUrl = this._getTemplateUrl(params);
                        let templateDescription = this._getTemplateDescription(templateUrl);
                        if (templateDescription) {
                            resolve(templateDescription);
                        } else {
                            const request = Vue.http.get(templateUrl);
                            app.fwkCallService(request).then((response) => {
                                templateDescription = this._setTemplateDescription(templateUrl, response.bodyText);
                                resolve(templateDescription);
                            });
                        }
                    });
                },
                _useComponent: function (params) {
                    return (resolve, reject) => {
                        // load js
                        this._loadComponent(params).then((componentDescription) => {
                            if (componentDescription.template) {
                                resolve(componentDescription);
                            } else {
                                // load html
                                this._loadTemplate(params).then((templateDescription) => {
                                    componentDescription.template = templateDescription;
                                    resolve(componentDescription);
                                });
                            }
                        });
                    };
                },
                _defineComponent: function (id, description) {
                    this._componentCache[id] = description;
                },
                _bootstrapComponent: function (params) {
                    // load js
                    this._loadComponent(params).then((componentDescription) => {
                        componentDescription.i18n = Fwk.manager.I18nManager.initForApplication(params.locale || "en");
                        componentDescription.router = Fwk.manager.RouterManager.initForApplication(params.routes || []);
                        // load html
                        this._loadTemplate(params).then((templateDescription) => {
                            document.getElementById(params.id).innerHTML = templateDescription;
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
                    return params.componentUrl || ("js/" + Fwk.util.StringUtils.dasherize(params.id) + ".js");
                },
                _getTemplateUrl: function (params) {
                    return params.templateUrl || ("html/" + Fwk.util.StringUtils.dasherize(params.id) + ".html");
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
                            if (Fwk.manager.SecurityManager.isConnected() && response.status === 401) {
                                Fwk.manager.SecurityManager.sessionTimedOut();
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
    for (var manager in Fwk.manager) {
        Fwk.manager[manager].init();
    }
}(window.app || (window.app = {})));