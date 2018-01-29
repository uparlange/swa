"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "RegisterView" }, {
        data: function () {
            return {
                showRegisterBtn: false,
                title: app.fwkGetLabel({ key: "LABEL_REGISTER" }),
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
        methods: {
            validate: function () {
                if (this.$refs.form.validate()) {
                    this.errorMessage = "";
                    app.fwkUserRegister(this.login, this.password).then(() => {
                        // Nothing
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