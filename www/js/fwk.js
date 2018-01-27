"use strict";

(function (app) {
    app.Fwk = {
        manager: {
            RouterManager: {
                _router: null,
                _loginRoute: null,
                _secureRoutes: {},
                _requestedRouteBeforeLogin: null,
                initialize: function (routes) {
                    this._analyzeRoutes(routes);
                    this._router = new VueRouter({
                        routes: routes
                    });
                    this._router.beforeEach((to, from, next) => {
                        if (this._secureRoutes[to.fullPath] && app.Fwk.manager.SecurityManager.getToken() == null) {
                            this._requestedRouteBeforeLogin = to.fullPath;
                            next(this._loginRoute);
                        } else {
                            next();
                        }
                    });
                    this._router.afterEach((to, from) => {
                        app.Fwk.manager.EventManager.emit("FWK_ROUTE_CHANGED", {
                            from: from.fullPath,
                            to: to.fullPath
                        });
                    });
                    app.Fwk.manager.EventManager.on("FWK_LOGGED_IN", (user) => {
                        if (this._requestedRouteBeforeLogin != null) {
                            this.navigate(this._requestedRouteBeforeLogin);
                            this._requestedRouteBeforeLogin = null;
                        }
                    });
                    app.Fwk.manager.EventManager.on("FWK_SESSION_TIMED_OUT", () => {
                        this.navigate(this._loginRoute);
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
                            this._secureRoutes[path] = true;
                        } else if (element.login) {
                            this._loginRoute = path;
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
                            this._i18n.locale = this._locale;
                        } else {
                            this._initLocale(this._locale).then(() => {
                                this._i18n.locale = this._locale;
                            });
                        }
                    }
                },
                getLocale: function () {
                    return this._locale;
                },
                getLabel: function (key, locale, values) {
                    return this._i18n.t(key, locale, values);
                },
                _initLocale: function (locale) {
                    return new Promise((resolve, reject) => {
                        const localeFileUrl = "data/i18n/" + locale + ".json";
                        const request = Vue.http.get(localeFileUrl);
                        app.Fwk.util.HttpUtils.call(request).then((response) => {
                            this._i18n.setLocaleMessage(locale, response.body);
                            resolve();
                        });
                    });
                }
            },
            SecurityManager: {
                _token: null,
                getToken: function () {
                    return this._token;
                },
                logIn: function (login, password) {
                    return new Promise((resolve, reject) => {
                        const request = Vue.http.post("/services/login", {
                            login: login,
                            password: password
                        });
                        app.Fwk.util.HttpUtils.call(request).then((response) => {
                            this._token = response.body.data.token;
                            app.Fwk.manager.EventManager.emit("FWK_LOGGED_IN", response.body.data.user);
                        }, (response) => {
                            reject(response);
                        });
                    });

                },
                logOut: function () {
                    this._token = null;
                    app.Fwk.manager.EventManager.emit("FWK_LOGGED_OUT");
                },
                sessionTimedOut: function () {
                    this._token = null;
                    app.Fwk.manager.EventManager.emit("FWK_SESSION_TIMED_OUT");
                }
            },
            EventManager: {
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
            }
        },
        util: {
            StringUtils: {
                dasherize: function (str) {
                    return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
                }
            },
            ComponentUtils: {
                bootstrap: function (params) {
                    const fileName = app.Fwk.util.StringUtils.dasherize(params.id);
                    app.Fwk.util.HttpUtils.loadJS("js/" + fileName + ".js").then(() => {
                        const request = Vue.http.get("html/" + fileName + ".html");
                        app.Fwk.util.HttpUtils.call(request).then((response) => {
                            document.getElementById(params.id).innerHTML = response.bodyText;
                            const MainView = app[params.id];
                            MainView.i18n = app.Fwk.manager.I18nManager.initialize(params.locale || "en");
                            MainView.router = app.Fwk.manager.RouterManager.initialize(params.routes || []);
                            const vue = new Vue(MainView);
                            vue.$mount("#" + params.id);
                        });
                    });
                },
                getComponent: function (className) {
                    return function () {
                        return new Promise((resolve, reject) => {
                            const fileName = app.Fwk.util.StringUtils.dasherize(className);
                            app.Fwk.util.HttpUtils.loadJS("js/" + fileName + ".js").then(() => {
                                const request = Vue.http.get("html/" + fileName + ".html");
                                app.Fwk.util.HttpUtils.call(request).then((response) => {
                                    const componentDescription = app[className];
                                    componentDescription.template = response.bodyText;
                                    resolve(componentDescription);
                                });
                            })
                        });
                    }
                }
            },
            HttpUtils: {
                call: function (request) {
                    return new Promise((resolve, reject) => {
                        app.Fwk.manager.EventManager.emit("FWK_RESOURCE_LOADING_START");
                        request.then((response) => {
                            app.Fwk.manager.EventManager.emit("FWK_RESOURCE_LOADING_STOP");
                            resolve(response);
                        }, (response) => {
                            app.Fwk.manager.EventManager.emit("FWK_RESOURCE_LOADING_STOP");
                            if (app.Fwk.manager.SecurityManager.getToken() != null && response.status === 401) {
                                app.Fwk.manager.SecurityManager.sessionTimedOut();
                            } else {
                                reject(response);
                            }
                        });
                    });
                },
                loadJS: function (url) {
                    return new Promise((resolve, reject) => {
                        app.Fwk.manager.EventManager.emit("FWK_RESOURCE_LOADING_START");
                        const script = document.createElement("script");
                        script.onload = () => {
                            app.Fwk.manager.EventManager.emit("FWK_RESOURCE_LOADING_STOP");
                            resolve();
                        };
                        document.head.appendChild(script);
                        script.src = url;
                    });

                }
            }
        }
    };
}(window.app || (window.app = {})));