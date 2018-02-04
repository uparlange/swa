"use strict";

(function (app) {
    const componentId = "MainView";
    app.fwkDefineComponent({ id: componentId }, {
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
            // manage secure route and session timeout
            app.fwkGetEventBus().on("FWK_AUTHENTICATION_NEEDED", () => {
                app.fwkNavigate("/sign/in");
            });
            // manage logout
            app.fwkGetEventBus().on("FWK_SECURITY_TOKEN_FILLED", (event) => {
                if (!event.token) {
                    this._refreshProfileMenuLabel();
                    app.fwkNavigate("/home");
                }
            });
            // manage profile change : after signin or update in profile view
            app.fwkGetEventBus().on("PROFILE_CHANGED", (user) => {
                this._refreshProfileMenuLabel(user.firstName + " " + user.lastName);
            });
            // manage resource loading start
            app.fwkGetEventBus().on("FWK_RESOURCE_LOADING_START", () => {
                this.loading = true;
            });
            // manage resource loading stop
            app.fwkGetEventBus().on("FWK_RESOURCE_LOADING_STOP", () => {
                this.loading = false;
            });
            // manage application cache (manifest)
            app.fwkGetEventBus().on("FWK_APPLICATION_UPDATE_READY", () => {
                const label = app.fwkGetLabel({ key: "LABEL_NEW_VERSION_AVAILABLE" });
                app.fwkGetLogger(componentId).debug(label);
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