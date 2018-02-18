"use strict";

/**
 * @namespace app
 */
(function (app) {
    // correct eslint error "Vue" is not defined
    const Vue = window.Vue;
    // correct eslint error "VueRouter" is not defined
    const VueRouter = window.VueRouter;
    // correct eslint error "VueI18n" is not defined
    const VueI18n = window.VueI18n;
    // correct eslint error "io" is not defined
    const io = window.io;
    // params
    const loggerClassName = "Fwk";
    const getEventHandler = function (eventName) {
        return "_" + eventName + "handler";
    };
    const callHook = function (vm, hook, data) {
        if (vm.$options[hook]) {
            vm.$options[hook].call(vm, data);
        }
    };
    // Fwk
    const Fwk = {
        manager: {
            LogManager: {
                initForFwk: function () {
                    this._initApi();
                },
                postMessage: function (event) {
                    const appender = console;
                    appender[event.methodName](event.className, event.message);
                },
                _initApi: function () {
                    const appender = ("Worker" in window) ? new Worker("/js/fwk-logger-worker.js") : this;
                    /**
                     * @name fwkGetLogger
                     * @function
                     * @memberof app
                     * @param {String} className
                     * @returns {Object}
                     */
                    app.fwkGetLogger = (className) => {
                        return {
                            debug: function (message) {
                                this._log("debug", message);
                            },
                            warn: function (message) {
                                this._log("warn", message);
                            },
                            _log: function (methodName, message) {
                                appender.postMessage({ methodName: methodName, className: className, message: message });
                            }
                        }
                    }
                }
            },
            EventBus: {
                _vue: new Vue(),
                initForFwk: function () {
                    this._initApi();
                },
                emit: function (eventName, data) {
                    app.fwkGetLogger(loggerClassName).debug("EventBus emit event '" + eventName + "' with data '" + (data ? JSON.stringify(data) : "") + "'");
                    this._vue.$emit(eventName, data);
                },
                on: function (eventName, callback) {
                    this._vue.$on(eventName, callback);
                },
                off: function (eventName, callback) {
                    this._vue.$off(eventName, callback);
                },
                _initApi: function () {
                    /**
                     * @name fwkGetEventBus
                     * @function
                     * @memberof app
                     * @returns {Object}
                     */
                    app.fwkGetEventBus = () => {
                        return this;
                    };
                }
            },
            RouterManager: {
                _router: null,
                _scrollPositions: {},
                _requestedRouteBeforeLogin: null,
                initForFwk: function () {
                    this._initApi();
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
                        app.fwkGetLogger(loggerClassName).debug("Router navigate from '" + from.fullPath + "' to '" + to.fullPath + "'");
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
                },
                _initApi: function () {
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
                }
            },
            I18nManager: {
                _locale: null,
                _i18n: new VueI18n(),
                initForFwk: function () {
                    this._initApi();
                },
                initForApplication: function (locale) {
                    this._setLocale(locale);
                    return this._i18n;
                },
                _setLocale: function (locale) {
                    if (this._locale !== locale) {
                        this._locale = locale;
                        if (this._i18n.messages[this._locale] !== undefined) {
                            this._updateLocale(this._locale);
                        } else {
                            this._initLocale(this._locale).then(() => {
                                this._updateLocale(this._locale);
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
                _updateLocale: function (locale) {
                    app.fwkGetLogger(loggerClassName).debug("Set locale to : " + locale);
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
                        }, (response) => {
                            // TODO manage
                            reject(response);
                        });
                    });
                },
                _initApi: function () {
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
                     */
                    app.fwkSetLocale = (locale) => {
                        this._setLocale(locale);
                    };
                }
            },
            SecurityManager: {
                _token: null,
                initForFwk: function () {
                    this._initApi();
                },
                sessionTimedOut: function () {
                    this._setToken();
                    app.fwkGetEventBus().emit("FWK_AUTHENTICATION_NEEDED", {
                        to: app.fwkGetCurrentRoute().fullPath
                    });
                },
                isConnected: function () {
                    return (this._token != null);
                },
                _setToken: function (token) {
                    this._token = token;
                },
                _initApi: function () {
                    /**
                     * @name fwkGetCurrentAuthorizationToken
                     * @function
                     * @memberof app
                     * @returns {String}
                     */
                    app.fwkGetCurrentAuthorizationToken = () => {
                        return this._token;
                    };
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
                }
            },
            PluginManager: {
                _pluginCache: {},
                initForFwk: function () {
                    this._initApi();
                },
                _initApi: function () {
                    /**
                     * @name fwkDefinePlugin
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefinePlugin = (params, description) => {
                        app.fwkGetLogger(loggerClassName).debug("Define plugin '" + params.id + "'");
                        if (this._pluginCache[params.id]) {
                            app.fwkGetLogger(loggerClassName).warn("Plugin '" + params.id + "' already registered... definition's crushed !");
                        }
                        this._pluginCache[params.id] = description;
                        Vue.use(description);
                    };
                }
            },
            MixinManager: {
                _mixinCache: {},
                initForFwk: function () {
                    this._initApi();
                },
                _initApi: function () {
                    /**
                     * @name fwkDefineMixin
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefineMixin = (params, description) => {
                        app.fwkGetLogger(loggerClassName).debug("Define mixin '" + params.id + "'");
                        if (this._mixinCache[params.id]) {
                            app.fwkGetLogger(loggerClassName).warn("Mixin '" + params.id + "' already registered... definition's crushed !");
                        }
                        this._mixinCache[params.id] = description;
                    };
                    /**
                     * @name fwkUseMixin
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @returns {Object}
                     */
                    app.fwkUseMixin = (params) => {
                        return this._mixinCache[params.id];
                    };
                }
            },
            DirectiveManager: {
                _directiveCache: {},
                initForFwk: function () {
                    this._initApi();
                },
                _initApi: function () {
                    /**
                     * @name fwkDefineDirective
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefineDirective = (params, description) => {
                        app.fwkGetLogger(loggerClassName).debug("Define directive '" + params.id + "'");
                        if (this._directiveCache[params.id]) {
                            app.fwkGetLogger(loggerClassName).warn("Directive '" + params.id + "' already registered... definition's crushed !");
                        }
                        Vue.directive(app.fwkGetStringUtils().dasherize(params.id), description);
                        this._directiveCache[params.id] = true;
                    };
                }
            },
            FilterManager: {
                _filterCache: {},
                initForFwk: function () {
                    this._initApi();
                },
                _initApi: function () {
                    /**
                     * @name fwkDefineFilter
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {function} callback
                     */
                    app.fwkDefineFilter = (params, callback) => {
                        app.fwkGetLogger(loggerClassName).debug("Define filter '" + params.id + "'");
                        if (this._filterCache[params.id]) {
                            app.fwkGetLogger(loggerClassName).warn("Filter '" + params.id + "' already registered... definition's crushed !");
                        }
                        Vue.filter(params.id, callback);
                        this._filterCache[params.id] = true;
                    };
                }
            },
            ComponentManager: {
                _templateCache: {},
                _componentCache: {},
                initForFwk: function () {
                    this._initApi();
                },
                _loadComponent: function (params) {
                    return new Promise((resolve) => {
                        let componentDescription = this._getComponentDescription(params.id);
                        if (componentDescription) {
                            resolve(componentDescription);
                        } else {
                            const componentUrl = this._getComponentUrl(params);
                            app.fwkLoadJs(componentUrl).then(() => {
                                app.fwkGetLogger(loggerClassName).debug("Component file '" + componentUrl + "' loaded");
                                componentDescription = this._getComponentDescription(params.id);
                                resolve(componentDescription);
                            }, () => {
                                resolve(null);
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
                                app.fwkGetLogger(loggerClassName).debug("Template file '" + templateUrl + "' loaded");
                                templateDescription = this._setTemplateDescription(templateUrl, response.bodyText);
                                resolve(templateDescription);
                            }, () => {
                                resolve(null);
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
                                        if (!componentDescription) {
                                            reject(params.id);
                                        } else {
                                            componentDescription.template = templateDescription;
                                            resolve(componentDescription);
                                        }
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
                },
                _initApi: function () {
                    /**
                     * @name fwkDefineComponent
                     * @function
                     * @memberof app
                     * @param {Object} params
                     * @param {String} params.id
                     * @param {Object} description
                     */
                    app.fwkDefineComponent = (params, description) => {
                        app.fwkGetLogger(loggerClassName).debug("Define component '" + params.id + "'");
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
                        app.fwkGetLogger(loggerClassName).debug("Use component '" + params.id + "'");
                        Vue.component(app.fwkGetStringUtils().dasherize(params.id), this._useComponent(params));
                    };
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
                        app.fwkGetLogger(loggerClassName).debug("Use route component '" + params.id + "'");
                        return this._useComponent(params);
                    };
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
                        app.fwkGetLogger(loggerClassName).debug("Bootstrap component '" + params.id + "'");
                        this._bootstrapComponent(params);
                    };
                }
            },
            ResourceManager: {
                initForFwk: function () {
                    this._initApi();
                },
                _loadJs: function (url) {
                    return new Promise((resolve, reject) => {
                        const scriptExists = Array.from(document.getElementsByTagName("script")).find((element) => {
                            return element.src.indexOf(url) !== -1;
                        });
                        if (!scriptExists) {
                            app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_START");
                            const script = document.createElement("script");
                            script.onload = () => {
                                app.fwkGetEventBus().emit("FWK_RESOURCE_LOADING_STOP");
                                resolve();
                            };
                            script.onerror = () => {
                                reject();
                            };
                            document.head.appendChild(script);
                            script.src = url;
                        } else {
                            setTimeout(() => {
                                resolve();
                            }, 0);
                        }
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
                                if (typeof response.body !== "object") {
                                    response.body = { message: "TECHNICAL_ERROR" };
                                }
                                reject(response);
                            }
                        });
                    });
                },
                _initApi: function () {
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
                    /**
                     * @name fwkLoadJs
                     * @function
                     * @memberof app
                     * @param {String} url
                     * @returns {Promise}
                     */
                    app.fwkLoadJs = (url) => {
                        return this._loadJs(url);
                    };
                }
            },
            ApplicationManager: {
                initForFwk: function () {
                    this._initPwaManagment();
                    this._initConnectionManagment();
                    this._initMixins();
                    this._initPlugins();
                    app.fwkGetLogger(loggerClassName).debug("Running in standelone webapp : " + this.isStandelone());
                },
                isStandelone: function () {
                    return (this.isStandeloneIos() || this.isStandeloneChrome());
                },
                isStandeloneIos: function () {
                    return (navigator.standalone == true);
                },
                isStandeloneChrome: function () {
                    return (window.matchMedia("(display-mode: standalone)").matches);
                },
                _initMixins: function () {
                    const eventName = "FWK_APPLICATION_ONLINE_STATUS_CHANGED";
                    app.fwkDefineMixin({ id: "FwkApplicationMixin" }, {
                        beforeCreate: function () {
                            const eventHandler = getEventHandler(eventName);
                            this[eventHandler] = (data) => {
                                if (data.online) {
                                    callHook(this, "refreshData");
                                }
                            };
                            app.fwkGetEventBus().on(eventName, this[eventHandler]);
                        },
                        created: function () {
                            callHook(this, "refreshData");
                        },
                        beforeDestroy: function () {
                            const eventHandler = getEventHandler(eventName);
                            app.fwkGetEventBus().off(eventName, this[eventHandler]);
                        }
                    });
                },
                _initPlugins: function () {
                    app.fwkDefinePlugin({ id: "FwkApplicationPlugin" }, {
                        install: function (Vue) {
                            Vue.mixin(app.fwkUseMixin({ id: "FwkApplicationMixin" }));
                        }
                    });
                },
                _initPwaManagment: function () {
                    const serviceWorkerAvailable = "serviceWorker" in navigator;
                    const applicationCacheAvailable = "applicationCache" in window;
                    if (serviceWorkerAvailable) {
                        // https://github.com/GoogleChromeLabs/sw-precache/blob/master/demo/app/js/service-worker-registration.js
                        window.addEventListener("load", function () {
                            navigator.serviceWorker.register("/js/fwk-pwa-service-worker.js").then(function (reg) {
                                reg.onupdatefound = function () {
                                    var installingWorker = reg.installing;
                                    installingWorker.onstatechange = function () {
                                        switch (installingWorker.state) {
                                            case "installed":
                                                if (navigator.serviceWorker.controller) {
                                                    app.fwkGetLogger(loggerClassName).debug("New or updated content is available");
                                                    app.fwkGetEventBus().emit("FWK_APPLICATION_UPDATE_READY");
                                                } else {
                                                    app.fwkGetLogger(loggerClassName).debug("Content is now available offline");
                                                }
                                                break;
                                            case "redundant":
                                                app.fwkGetLogger(loggerClassName).debug("The installing service worker became redundant");
                                                break;
                                        }
                                    };
                                };
                            }).catch(function (e) {
                                app.fwkGetLogger(loggerClassName).debug("Error during service worker registration : " + e);
                            });
                        });
                    } else if (applicationCacheAvailable) {
                        // https://github.com/beebole/mobile-app-demo/blob/master/index.html
                        var iframe = document.createElement("iframe");
                        iframe.style.display = "none";
                        iframe.src = "/load-offline-cache";
                        document.body.appendChild(iframe);
                        window.addEventListener("load", function () {
                            window.applicationCache.addEventListener("updateready", function () {
                                if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                                    window.applicationCache.swapCache();
                                    app.fwkGetEventBus().emit("FWK_APPLICATION_UPDATE_READY");
                                }
                            });
                        });
                    }
                },
                _initConnectionManagment: function () {
                    window.addEventListener("offline", () => {
                        this._onlineStatus();
                    });
                    window.addEventListener("online", () => {
                        this._onlineStatus();
                    });
                },
                _onlineStatus: function () {
                    app.fwkGetEventBus().emit("FWK_APPLICATION_ONLINE_STATUS_CHANGED", { online: navigator.onLine });
                }
            },
            UtilManager: {
                initForFwk: function () {
                    this._initApi();
                },
                StringUtils: {
                    dasherize: function (str) {
                        return str.trim().replace(/([A-Z])/g, "-$1").replace(/[-_\s]+/g, "-").toLowerCase().substring(1);
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
                },
                LocationUtils: {
                    getCurrentLocation: function (key) {
                        return new Promise((resolve) => {
                            const location = {};
                            this.getCurrentPosition().then((response) => {
                                location.lat = response.coords.latitude;
                                location.long = response.coords.longitude;
                                this.getAddresses(location.lat, location.long, key).then((response) => {
                                    if (response.body.results.length > 0) {
                                        location.address = response.body.results[0].formatted_address;
                                    }
                                    resolve(location);
                                }, () => {
                                    resolve(location);
                                });
                            }, () => {
                                resolve(location);
                            });
                        });
                    },
                    getCurrentPosition: function () {
                        return new Promise((resolve) => {
                            navigator.geolocation.getCurrentPosition((response) => {
                                resolve(response);
                            }, () => {
                                resolve({});
                            });
                        });
                    },
                    getAddresses: function (lat, long, key) {
                        let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=true";
                        if (key) {
                            url += "&key=" + key;
                        }
                        const request = Vue.http.get(url);
                        return app.fwkCallService(request);
                    }
                },
                _initApi: function () {
                    /**
                     * @name fwkGetCurrentLocation
                     * @function
                     * @memberof app
                     * @param {String} [key]
                     * @returns {Promise}
                     */
                    app.fwkGetCurrentLocation = (key) => {
                        return this.LocationUtils.getCurrentLocation(key);
                    };
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
                }
            },
            SocketManager: {
                _handlers: [
                    { name: "FWK_WS_CLIENT_ADDED", hook: "afterSocketClientAdded" },
                    { name: "FWK_WS_CLIENT_REMOVED", hook: "afterSocketClientRemoved" },
                    { name: "FWK_WS_MESSAGE_RECEIVED", hook: "afterSocketMessageReceived" },
                ],
                initForFwk: function () {
                    this._initMixins();
                    this._initPlugins();
                },
                _initMixins: function () {
                    app.fwkDefineMixin({ id: "FwkSocketIoMixin" }, {
                        beforeCreate: function () {
                            Fwk.manager.SocketManager._handlers.forEach((handler) => {
                                const eventHandler = getEventHandler(handler.name);
                                this[eventHandler] = (event) => {
                                    if (handler.hook) {
                                        callHook(this, handler.hook, event);
                                    }
                                };
                                app.fwkGetEventBus().on(handler.name, this[eventHandler]);
                            });
                        },
                        beforeDestroy: function () {
                            Fwk.manager.SocketManager._handlers.forEach((handler) => {
                                const eventHandler = getEventHandler(handler.name);
                                app.fwkGetEventBus().off(handler.name, this[eventHandler]);
                            });
                        }
                    });
                },
                _initPlugins: function () {
                    app.fwkDefinePlugin({ id: "FwkSocketIoPlugin" }, {
                        install: function (Vue) {
                            Vue.mixin(app.fwkUseMixin({ id: "FwkSocketIoMixin" }));
                            Vue.prototype.$socket = {
                                _socket: null,
                                sendMessage: function (params) {
                                    return new Promise((resolve) => {
                                        this._socket.emit("FWK_WS_SEND_MESSAGE", params, (response) => {
                                            resolve(response);
                                        });
                                    });
                                },
                                getClientList: function () {
                                    return new Promise((resolve) => {
                                        this._socket.emit("FWK_WS_GET_CLIENT_LIST", null, (response) => {
                                            resolve(response);
                                        });
                                    });
                                },
                                connect: function (url, userData) {
                                    return new Promise((resolve) => {
                                        if (!this._socket) {
                                            this._socket = io.connect(url);
                                            Fwk.manager.SocketManager._handlers.forEach((handler) => {
                                                this._socket.on(handler.name, (event) => {
                                                    app.fwkGetEventBus().emit(handler.name, event);
                                                });
                                            });
                                            this._socket.emit("FWK_WS_SET_USER_DATA", userData, () => {
                                                resolve();
                                            });
                                        } else {
                                            setTimeout(() => {
                                                resolve();
                                            }, 0);
                                        }
                                    });
                                }
                            };
                        }
                    });
                }
            }
        }
    };
    // init managers
    for (var manager in Fwk.manager) {
        Fwk.manager[manager].initForFwk();
    }
}(window.app || (window.app = {})));