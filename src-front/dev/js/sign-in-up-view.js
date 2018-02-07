"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "SignInUpView" }, {
        data: function () {
            return {
                showRegisterBtn: null,
                showCancelBtn: null,
                title: null,
                valid: true,
                login: "j.doe@lost.com",
                loginRules: [
                    app.fwkGetFormUtils().requiredRule(),
                    app.fwkGetFormUtils().emailRule()
                ],
                password: "password",
                passwordRules: [
                    app.fwkGetFormUtils().requiredRule(),
                    app.fwkGetFormUtils().minLengthRule(8)
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
                const request = this.$http.post("/services/users/login", {
                    login: this.login,
                    password: this.password
                });
                app.fwkCallService(request).then((response) => {
                    app.fwkSetAuthorizationToken(response.body.data.token);
                    app.fwkGetEventBus().emit("PROFILE_CHANGED", response.body.data.user);
                }, (response) => {
                    this._showMessage(response.body.message);
                });
            },
            _validateSignUp: function () {
                const request = this.$http.post("/services/users/register", {
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