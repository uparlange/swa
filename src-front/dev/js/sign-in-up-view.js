"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "SignInUpView" }, {
        data: function () {
            return {
                showRegisterBtn: null,
                showCancelBtn: null,
                title: null,
                valid: true,
                login: "",
                loginRules: [
                    (v) => !!v || app.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" }),
                    (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(v) || app.fwkGetLabel({ key: "ERROR_FIELD_MUST_BE_VALID_EMAIL" })
                ],
                password: "",
                passwordRules: [
                    (v) => !!v || app.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" }),
                    (v) => v && v.length >= 8 || app.fwkGetLabel({ key: "ERROR_FIELD_HAS_MIN_LENGTH", values: { length: 8 } })
                ],
                message: {
                    visible: false,
                    value: ""
                },
                _type: null
            }
        },
        created: function () {
            this._init(app.fwkGetCurrentRoute().params.type);
            if (window.location.search.indexOf("debug")) {
                this.login = "j.doe@lost.com";
                this.password = "password";
            }
        },
        beforeRouteUpdate(to, from, next) {
            this._init(to.params.type);
            next();
        },
        methods: {
            validate: function () {
                if (this.$refs.form.validate()) {
                    if (this._signIn()) {
                        this._validateSignIn();
                    } else {
                        this._validateSignUp();
                    }
                }
            },
            _validateSignIn: function () {
                const request = this.$http.post("/services/login", {
                    login: this.login,
                    password: this.password
                });
                app.fwkCallService(request).then((response) => {
                    app.fwkSetAuthorizationToken(response.body.data.token);
                }, (response) => {
                    this._showMessage(response.body.message);
                });
            },
            _validateSignUp: function () {
                const request = this.$http.post("/services/register", {
                    login: this.login,
                    password: this.password
                });
                app.fwkCallService(request).then(() => {
                    // TODO display register ok
                    app.fwkNavigate("/sign/in");
                }, (response) => {
                    this._showMessage(response.body.message);
                });
            },
            _init: function (type) {
                this._type = type;
                if (this._signIn()) {
                    this.showRegisterBtn = true;
                    this.showCancelBtn = false;
                    this.title = app.fwkGetLabel({ key: "LABEL_AUTHENTIFICATION" });
                } else {
                    this.showRegisterBtn = false;
                    this.showCancelBtn = true;
                    this.title = app.fwkGetLabel({ key: "LABEL_REGISTER" });
                }
            },
            _signIn: function () {
                return (this._type === "in");
            },
            _showMessage: function (value) {
                this.message.value = value;
                this.message.visible = true;
                setTimeout(() => {
                    this.message.visible = false;
                }, 3000);
            }
        }
    });
}(window.app || (window.app = {})));