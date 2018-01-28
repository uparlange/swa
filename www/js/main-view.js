"use strict";

(function (app) {
    app.fwkRegisterRouteComponent("MainView", {
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
            app.fwkGetEventBus().on("FWK_USER_SIGNED_IN", (user) => {
                this._refreshProfileMenuLabel(user.firstName + " " + user.lastName);
            });
            app.fwkGetEventBus().on("FWK_USER_SIGNED_OUT", () => {
                this._refreshProfileMenuLabel();
            });
            app.fwkGetEventBus().on("FWK_RESOURCE_LOADING_START", () => {
                this.loading = true;
            });
            app.fwkGetEventBus().on("FWK_RESOURCE_LOADING_STOP", () => {
                this.loading = false;
            });
            this._refreshProfileMenuLabel();
        },
        methods: {
            _refreshProfileMenuLabel: function (label) {
                this.menus[2].label = label || "Profile";
            }
        }
    });
}(window.app || (window.app = {})));