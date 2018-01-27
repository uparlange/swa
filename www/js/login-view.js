"use strict";

(function (app) {
    app.LoginView = {
        data: function () {
            return {
                login: "",
                password: "",
                errorMessage: ""
            }
        },
        created: function () {
            if (window.location.search.indexOf("debug") !== -1) {
                this.login = "j.doe@lost.com";
                this.password = "password";
                this.authenticate();
            }
        },
        methods: {
            authenticate: function () {
                if (this.login.length > 0 && this.password.length > 0) {
                    this.errorMessage = "";
                    app.Fwk.manager.SecurityManager.logIn(this.login, this.password).then((response) => {
                        // Nothing
                    }, (response) => {
                        this.errorMessage = response.body.message;
                    })
                }
            }
        }
    };
}(window.app || (window.app = {})));