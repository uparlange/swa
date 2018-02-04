"use strict";

(function (app) {
    /**
     * @namespace app
     */
    const Vue = window.Vue;
    const VueRouter = window.VueRouter;
    const VueI18n = window.VueI18n;
    const LoggerClassName = "Fwk";
    const Fwk = {
        manager: {
            RouterManager: {
                _router: null,
                _scrollPositions: {},
                _requestedRouteBeforeLogin: null,
                init: function () {
                    /**
                     * @name fwkGetCurrentRoute
                     * @function
                     * @memberof app
                     * @returns {Object}
                     */
                    app.fwkGetCurrentRoute = () => {
                        return this._getCurrentRoute();
                    };
                    /**
                     * @name fwkNavigate
                     * @function
                     * @memberof app
                     * @param {Object} location
                     * @param {Function} onComplete
                     * @param {Function} onAbort
                     */
                    app.fwkNavigate = (location, onComplete, onAbort) => {
                        this.navigate(location, onComplete, onAbort);
                    };
                },
                initForApplication: function (routes) {
                    this._router = new VueRouter({
                        routes: routes,
                        scrollBehavior: (to) => {
                            // restore scroll position
                            return { x: 0, y: (this._scrollPositions[to.fullPath] || 0) };
                        }
                    });
                    this._router.beforeEach((to, from, next) => {
                        // save scroll position
                        this._scrollPositions[from.fullPath] = window.pageYOffset;
                        // check if route secured
                        if (to.matched.some((record) => { return record.meta.secure }) && !Fwk.manager.SecurityManager.isConnected()) {
                            app.fwkGetEventBus().emit("FWK_AUTHENTICATION_NEEDED", {
                                to: to.fullPath
                            });
                            next(false);
                        }
                        else {
                            next();
                        }
                    });
                    this._router.afterEach((to, from) => {
                        app.fwkGetLogger(LoggerClassName).debug("Router navigate from '" + from.fullPath + "' to '" + to.fullPath + "'");
                    });
                    app.fwkGetEventBus().on("FWK_AUTHENTICATION_NEEDED", (event) => {
                        this._requestedRouteBeforeLogin = event.to;
                    });
                    app.fwkGetEventBus().on("FWK_SECURITY_TOKEN_FILLED", () => {
                        if (this._requestedRouteBeforeLogin != null) {
                            this.navigate(this._requestedRouteBeforeLogin);
                            this._requestedRouteBeforeLogin = null;
                        }
                    });
                    return this._router;
                },
                navigate: function (location, onComplete, onAbort) {
                    this._router.push(location, onComplete, onAbort);
                },
                _getCurrentRoute: function () {
                    return this._router.currentRoute;
                }
            },
            I18nManager: {
                _locale: null,
                _i18n: new VueI18n(),
                init: function () {
                    /**
                     * @name fwkGetLabel
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.key
                     * @param {String} [params.locale]
                     * @param {Object} [params.values]
                     * @returns {String}
                     */
                    app.fwkGetLabel = (params) => {
                        return this._getLabel(params);
                    };
                    /**
                     * @name fwkGetCurrentLocale
                     * @function
                     * @memberof app
                     * @returns {String}
                     */
                    app.fwkGetCurrentLocale = () => {
                        return this._getLocale();
                    };
                    /**
                     * @name fwkSetLocale
                     * @function
                     * @memberof app
                     * @param {String} locale
                     * @returns {String}
                     */
                    app.fwkSetLocale = (locale) => {
                        this._setLocale(locale);
                    };
                },
                initForApplication: function (locale) {
                    this._setLocale(locale);
                    return this._i18n;
                },
                _setLocale: function (locale) {
                    if (this._locale !== locale) {
                        this._locale = locale;
                        if (this._i18n.messages[this._locale] !== undefined) {
                            this._setUpdateLocale(this._locale);
                        } else {
                            this._initLocale(this._locale).then(() => {
                                this._setUpdateLocale(this._locale);
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
                _setUpdateLocale: function (locale) {
                    this._i18n.locale = locale;
                    document.querySelector("html").setAttribute("lang", locale);
                },
                _initLocale: function (locale) {
                    return new Promise((resolve) => {
                        const localeFileUrl = "data/i18n/" + locale + ".json";
                        const request = Vue.http.get(localeFileUrl);
                        app.fwkCallService(request).then((response) => {
                            this._i18n.setLocaleMessage(locale, response.body);
                            resolve();
                        }, () => {
                            // TODO manage
                        });
                    });
                }
            },
            SecurityManager: {
                init: function () {
                    /**
                     * @name fwkSetAuthorizationToken
                     * @function
                     * @memberof app
                     * @param {String} token 
                     */
                    app.fwkSetAuthorizationToken = (token) => {
                        this._setToken(token);
                        app.fwkGetEventBus().emit("FWK_SECURITY_TOKEN_FILLED", {
                            token: token
                        });
                    };
                },
                sessionTimedOut: function () {
                    this._setToken();
                    app.fwkGetEventBus().emit("FWK_AUTHENTICATION_NEEDED", {
                        to: app.fwkGetCurrentRoute().fullPath
                    });
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
                init: function () {
                    /**
                     * @name fwkGetEventBus
                     * @function
                     * @memberof app
                     * @returns {Object}
                     */
                    app.fwkGetEventBus = () => {
                        return this;
                    };
                },
                emit: function (eventName, data) {
                    app.fwkGetLogger(LoggerClassName).debug("EventBus emit event '" + eventName + "' with data '" + (data ? JSON.stringify(data) : "") + "'");
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
                _filterCache: {},
                init: function () {
                    // components
                    /**
                     * @name fwkDefineComponent
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefineComponent = (params, description) => {
                        app.fwkGetLogger(LoggerClassName).debug("Define component '" + params.id + "'");
                        this._defineComponent(params.id, description);
                    };
                    /**
                     * @name fwkUseComponent
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {String} [params.componentUrl]
                     * @param {String} [params.templateUrl]
                     */
                    app.fwkUseComponent = (params) => {
                        app.fwkGetLogger(LoggerClassName).debug("Use component '" + params.id + "'");
                        Vue.component(app.fwkGetStringUtils().dasherize(params.id), this._useComponent(params));
                    };
                    // filters
                    /**
                     * @name fwkDefineFilter
                     * @function
                     * @memberof app
                     * @param {String} name
                     * @param {function} callback
                     */
                    app.fwkDefineFilter = (name, callback) => {
                        app.fwkGetLogger(LoggerClassName).debug("Define filter '" + name + "'");
                        if (this._filterCache[name]) {
                            app.fwkGetLogger(LoggerClassName).warn("Filter '" + name + "' already registered... definition's crushed !");
                        }
                        Vue.filter(name, callback);
                        this._filterCache[name] = true;
                    };
                    // directives
                    /**
                     * @name fwkDefineDirective
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefineDirective = (params, description) => {
                        app.fwkGetLogger(LoggerClassName).debug("Define directive '" + params.id + "'");
                        if (this._directiveCache[params.id]) {
                            app.fwkGetLogger(LoggerClassName).warn("Directive '" + params.id + "' already registered... definition's crushed !");
                        }
                        Vue.directive(app.fwkGetStringUtils().dasherize(params.id), description);
                        this._directiveCache[params.id] = true;
                    };
                    // route components
                    /**
                     * @name fwkUseRouteComponent
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {String} [params.componentUrl]
                     * @param {String} [params.templateUrl]
                     */
                    app.fwkUseRouteComponent = (params) => {
                        app.fwkGetLogger(LoggerClassName).debug("Use route component '" + params.id + "'");
                        return this._useComponent(params);
                    };
                    // application
                    /**
                     * @name fwkBootstrapComponent
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {List} [params.routes]
                     * @param {String} [params.locale]
                     */
                    app.fwkBootstrapComponent = (params) => {
                        app.fwkGetLogger(LoggerClassName).debug("Bootstrap component '" + params.id + "'");
                        this._bootstrapComponent(params);
                    };
                },
                _loadComponent: function (params) {
                    return new Promise((resolve) => {
                        let componentDescription = this._getComponentDescription(params.id);
                        if (componentDescription) {
                            resolve(componentDescription);
                        } else {
                            const componentUrl = this._getComponentUrl(params);
                            Fwk.manager.ResourceManager.loadJs(componentUrl).then(() => {
                                app.fwkGetLogger(LoggerClassName).debug("Component file '" + componentUrl + "' loaded");
                                componentDescription = this._getComponentDescription(params.id);
                                resolve(componentDescription);
                            }, () => {
                                // TODO manage
                            });
                        }
                    });
                },
                _loadTemplate: function (params) {
                    return new Promise((resolve) => {
                        const templateUrl = this._getTemplateUrl(params);
                        let templateDescription = this._getTemplateDescription(templateUrl);
                        if (templateDescription) {
                            resolve(templateDescription);
                        } else {
                            const request = Vue.http.get(templateUrl);
                            app.fwkCallService(request).then((response) => {
                                app.fwkGetLogger(LoggerClassName).debug("Template file '" + templateUrl + "' loaded");
                                templateDescription = this._setTemplateDescription(templateUrl, response.bodyText);
                                resolve(templateDescription);
                            }, () => {
                                // TODO manage
                            });
                        }
                    });
                },
                _useComponent: function (params) {
                    return (resolve, reject) => {
                        // load js
                        this._loadComponent(params).then((componentDescription) => {
                            if (!componentDescription) {
                                reject(params.id);
                            } else {
                                if (componentDescription.template) {
                                    resolve(componentDescription);
                                } else {
                                    // load html
                                    this._loadTemplate(params).then((templateDescription) => {
                                        componentDescription.template = templateDescription;
                                        resolve(componentDescription);
                                    });
                                }
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
                    return params.componentUrl || ("js/" + app.fwkGetStringUtils().dasherize(params.id) + ".js");
                },
                _getTemplateUrl: function (params) {
                    return params.templateUrl || ("html/" + app.fwkGetStringUtils().dasherize(params.id) + ".html");
                }
            },
            ResourceManager: {
                init: function () {
                    /**
                     * @name fwkCallService
                     * @function
                     * @memberof app
                     * @param {Object} request
                     * @returns {Promise}
                     */
                    app.fwkCallService = (request) => {
                        return this._callService(request);
                    };
                },
                loadJs: function (url) {
                    return new Promise((resolve) => {
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
            },
            ApplicationManager: {
                init: function () {
                    // manifest
                    window.applicationCache.addEventListener("updateready", () => {
                        this._updateReady();
                    });
                    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                        this._updateReady();
                    }
                    // connection
                    window.addEventListener("offline", () => {
                        this._onlineStatus();
                    });
                    window.addEventListener("online", () => {
                        this._onlineStatus();
                    });
                },
                _updateReady: function () {
                    app.fwkGetEventBus().emit("FWK_APPLICATION_UPDATE_READY");
                },
                _onlineStatus: function () {
                    app.fwkGetEventBus().emit("FWK_APPLICATION_ONLINE_STATUS_CHANGED", { online: navigator.onLine });
                }
            },
            LogManager: {
                init: function () {
                    /**
                     * @name fwkGetLogger
                     * @function
                     * @memberof app
                     * @param {String} className
                     * @returns {Object}
                     */
                    app.fwkGetLogger = (className) => {
                        return {
                            _console: console,
                            debug: function (message) {
                                this._console.debug(this._getMessage(message));
                            },
                            warn: function (message) {
                                this._console.warn(this._getMessage(message));
                            },
                            _getMessage: function (message) {
                                return className + ": " + message;
                            }
                        }
                    }
                }
            },
            UtilManager: {
                init: function () {
                    /**
                     * @name fwkGetStringUtils
                     * @function
                     * @memberof app
                     * @returns {Object}
                     */
                    app.fwkGetStringUtils = () => {
                        return this.StringUtils;
                    };
                    /**
                     * @name fwkGetFormUtils
                     * @function
                     * @memberof app
                     * @returns {Object}
                     */
                    app.fwkGetFormUtils = () => {
                        return this.FormUtils;
                    };
                },
                StringUtils: {
                    dasherize: function (str) {
                        return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
                    },
                    zerofill: function (value, length) {
                        if (!value) return "";
                        let v = "" + value;
                        while (v.length < length) {
                            v = "0" + v;
                        }
                        return v;
                    }
                },
                FormUtils: {
                    requiredRule: function () {
                        return function (value) {
                            return !!value || app.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" });
                        }
                    },
                    emailRule: function () {
                        return function (value) {
                            return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(value) || app.fwkGetLabel({ key: "ERROR_FIELD_MUST_BE_VALID_EMAIL" });
                        }
                    },
                    minLengthRule: function (length) {
                        return function (value) {
                            return value && value.length >= length || app.fwkGetLabel({ key: "ERROR_FIELD_HAS_MIN_LENGTH", values: { length: length } })
                        }
                    }
                }
            }
        }
    };
    for (var manager in Fwk.manager) {
        Fwk.manager[manager].init();
    }
}(window.app || (window.app = {})));