"use strict";

(function (app) {
    const componentId = "MainView";
    app.fwkDefineComponent({ id: componentId }, {
        data: function () {
            return {
                drawer: null,
                loading: false,
                snackbar: {
                    visible: false,
                    y: "bottom",
                    x: null,
                    mode: "",
                    timeout: 3000,
                    text: ""
                },
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
            // manage connection status
            app.fwkGetEventBus().on("FWK_APPLICATION_ONLINE_STATUS_CHANGED", (event) => {
                const label = app.fwkGetLabel({ key: event.online ? "LABEL_CONNECTED" : "LABEL_NO_CONNECTION" });
                this._showSnackbar(label);
            });
            // manage application cache (manifest)
            app.fwkGetEventBus().on("FWK_APPLICATION_UPDATE_READY", () => {
                const label = app.fwkGetLabel({ key: "LABEL_NEW_VERSION_AVAILABLE" });
                if (confirm(label)) {
                    window.location.reload();
                }
            });
            this._refreshProfileMenuLabel();
        },
        methods: {
            _refreshProfileMenuLabel: function (label) {
                this.menus[2].label = label || "Profile";
            },
            _showSnackbar: function (text) {
                this.snackbar.text = text;
                this.snackbar.visible = true;
            }
        }
    });
}(window.app || (window.app = {})));