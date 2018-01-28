"use strict";

(function (app) {
    app.Fwk.manager.ComponentManager.register("LoginView", {
        data: function () {
            return {
                showRegisterBtn: true,
                title: this.fwkGetLabel({ key: "LABEL_AUTHENTIFICATION" }),
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
                    this.errorMessage = "";
                    this.fwkLogin(this.login, this.password).then((response) => {

                    }, (response) => {
                        this.errorMessage = response.body.message;
                    })
                }
            }
        }
    });
}(window.app || (window.app = {})));