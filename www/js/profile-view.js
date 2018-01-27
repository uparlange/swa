"use strict";

(function (app) {
    app.ProfileView = {
        data: function () {
            return {

            }
        },
        created: function () {
            const request = this.$http.get("/services/profile", {
                headers: {
                    "Authorization": "Bearer " + app.Fwk.manager.SecurityManager.getToken()
                }
            })
            app.Fwk.util.HttpUtils.call(request).then((response) => {
                this.profile = response.body.data.user;
            });
        },
        methods: {
            logOut: function () {
                app.Fwk.manager.SecurityManager.logOut();
            }
        }
    };
}(window.app || (window.app = {})));