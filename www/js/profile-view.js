"use strict";

(function (app) {
    app.Fwk.manager.ComponentManager.register("ProfileView", {
        data: function () {
            return {

            }
        },
        created: function () {
            const request = Vue.http.get("/services/user");
            this.fwkCallService(request).then((response) => {
                this.profile = response.body.data.user;
            });
        },
        methods: {
            logout: function () {
                this.fwkLogout();
            }
        }
    });
}(window.app || (window.app = {})));