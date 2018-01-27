"use strict";

(function (app) {
    app.MainView = {
        data: function () {
            return {
                drawer: null,
                loading: false,
                menus: [
                    { labelKey: "LABEL_HOME", icon: "home", link: "/home" },
                    { labelKey: "LABEL_EVENTS", icon: "event", link: "/myspace/events" },
                    { label: "", icon: "mood", link: "/myspace/profile" }
                ]
            }
        },
        created: function () {
            app.Fwk.manager.EventManager.on("FWK_LOGGED_IN", (user) => {
                this._refreshProfileMenuLabel(user.firstName + " " + user.lastName);
            });
            app.Fwk.manager.EventManager.on("FWK_LOGGED_OUT", () => {
                this._refreshProfileMenuLabel();
                app.Fwk.manager.RouterManager.navigate("/home");
            });
            app.Fwk.manager.EventManager.on("FWK_RESOURCE_LOADING_START", () => {
                this.loading = true;
            });
            app.Fwk.manager.EventManager.on("FWK_RESOURCE_LOADING_STOP", () => {
                this.loading = false;
            });
            this._refreshProfileMenuLabel();
        },
        methods: {
            _refreshProfileMenuLabel: function (label) {
                this.menus[2].label = label || "Profile";
            }
        }
    };
}(window.app || (window.app = {})));