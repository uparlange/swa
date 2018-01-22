const Fwk = {
    manager: {
        I18nManager: {
            _defaultLocale: "en",
            _locale: null,
            _i18n: new VueI18n(),
            initialize: function () {
                this.setLocale(this._defaultLocale);
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
            _initLocale: function (locale) {
                return new Promise((resolve, reject) => {
                    const localeFileUrl = "data/i18n/" + locale + ".json";
                    const request = Vue.http.get(localeFileUrl);
                    Fwk.util.HttpUtils.call(request).then((response) => {
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
                    Fwk.util.HttpUtils.call(request).then((response) => {
                        this._token = response.body.token;
                        Fwk.manager.EventManager.emit("loggedIn", response.body.profile);
                    }, (response) => {
                        reject(response);
                    });
                });

            },
            logOut: function () {
                this._token = null;
                Fwk.manager.EventManager.emit("loggedOut");
            },
            sessionTimedOut: function () {
                this._token = null;
                Fwk.manager.EventManager.emit("sessionTimedOut");
            }
        },
        EventManager: {
            _vue: new Vue(),
            emit: function (eventName, data) {
                this._vue.$emit(eventName, data);
            },
            on: function (eventName, callback) {
                this._vue.$on(eventName, callback);
            }
        }
    },
    util: {
        ComponentUtils: {
            getComponent: function (name, componentDescription) {
                return function () {
                    return new Promise(function (resolve, reject) {
                        const templateUrl = "html/" + name + ".html";
                        const request = Vue.http.get(templateUrl);
                        Fwk.util.HttpUtils.call(request).then(function (response) {
                            componentDescription.template = response.bodyText;
                            resolve(componentDescription);
                        });
                    });
                }
            }
        },
        HttpUtils: {
            call: function (request) {
                return new Promise(function (resolve, reject) {
                    request.then((response) => {
                        resolve(response);
                    }, (response) => {
                        if (Fwk.manager.SecurityManager.getToken() != null && response.status === 401) {
                            Fwk.manager.SecurityManager.sessionTimedOut();
                        } else {
                            reject(response);
                        }
                    });
                });
            }
        }
    }
};