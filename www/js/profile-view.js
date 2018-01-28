"use strict";

(function (app) {
    app.fwkRegisterRouteComponent("ProfileView", {
        data: function () {
            return {

            }
        },
        created: function () {
            const request = Vue.http.get("/services/user");
            app.fwkCallService(request).then((response) => {
                this.profile = response.body.data.user;
            });
        },
        methods: {
            logout: function () {
                app.fwkLogout();
            }
        }
    });
}(window.app || (window.app = {})));