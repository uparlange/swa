"use strict";

(function (app) {
    app.Fwk.manager.ComponentManager.register("RegisterView", {
        data: function () {
            return {
                showRegisterBtn: false,
                title: this.fwkGetLabel({ key: "LABEL_REGISTER" }),
                valid: true,
                login: "",
                loginRules: [
                    (v) => !!v || this.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" }),
                    (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || this.fwkGetLabel({ key: "ERROR_FIELD_MUST_BE_VALID_EMAIL" })
                ],
                password: "",
                passwordRules: [
                    (v) => !!v || this.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" }),
                    (v) => v && v.length >= 8 || this.fwkGetLabel({ key: "ERROR_FIELD_HAS_MIN_LENGTH", values: { length: 8 } })
                ],
                errorMessage: ""
            }
        },
        methods: {
            validate: function () {
                if (this.$refs.form.validate()) {
                    this.errorMessage = "";
                    this.fwkRegister(this.login, this.password).then((response) => {
                        // Nothing
                    }, (response) => {
                        this.errorMessage = response.body.message;
                    })
                }
            }
        }
    });
}(window.app || (window.app = {})));