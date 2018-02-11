"use strict";

(function (app) {
    let currentProfile = null;
    app.fwkDefineComponent({ id: "ProfileView" }, {
        data: function () {
            return {
                valid: true,
                profile: {},
                location: {},
                rules: [
                    (v) => !!v || app.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" })
                ]
            }
        },
        refreshData: function () {
            this._refreshData();
        },
        methods: {
            logout: function () {
                app.fwkSetAuthorizationToken(null);
            },
            validate: function () {
                if (this.$refs.form.validate()) {
                    const request = this.$http.put("/services/users/current", this.profile, { headers: { Authorization: "Bearer " + app.fwkGetCurrentAuthorizationToken() } });
                    app.fwkCallService(request).then((response) => {
                        this._setProfile(response.body.data.user);
                        app.fwkGetEventBus().emit("PROFILE_CHANGED", response.body.data.user);
                    }, () => {
                        // TODO manage
                    });
                }
            },
            hasChanges: function () {
                return !(JSON.stringify(currentProfile) == JSON.stringify(this.profile));
            },
            _setProfile: function (profile) {
                currentProfile = Object.assign({}, profile);
                this.profile = profile;
            },
            _refreshData: function () {
                // position
                app.fwkGetCurrentLocation().then((location) => {
                    this.location = location;
                }, () => {
                    // TODO manage
                })
                // profile
                const request = this.$http.get("/services/users/current", { headers: { Authorization: "Bearer " + app.fwkGetCurrentAuthorizationToken() } });
                app.fwkCallService(request).then((response) => {
                    this._setProfile(response.body.data.user);
                }, () => {
                    // TODO manage
                });
            }
        }
    });
}(window.app || (window.app = {})));