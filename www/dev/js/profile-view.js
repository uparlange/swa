"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "ProfileView" }, {
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
                app.fwkUserLogout();
            }
        }
    });
}(window.app || (window.app = {})));