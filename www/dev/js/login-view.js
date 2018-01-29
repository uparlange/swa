"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "LoginView" }, {
        data: function () {
            return {
                showRegisterBtn: true,
                title: app.fwkGetLabel({ key: "LABEL_AUTHENTIFICATION" }),
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
                }
            }
        },
        created: function () {
            if (window.location.search.indexOf("debug") !== -1) {
                this.login = "j.doe@lost.com";
                this.password = "password";
            }
        },
        mounted: function () {
            if (window.location.search.indexOf("debug") !== -1) {
                this.validate();
            }
        },
        methods: {
            validate: function () {
                if (this.$refs.form.validate()) {
                    app.fwkUserLogin(this.login, this.password).then(() => {

                    }, (response) => {
                        this._showMessage(response.body.message);
                    })
                }
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