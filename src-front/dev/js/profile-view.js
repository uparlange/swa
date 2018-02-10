"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "ProfileView" }, {
        data: function () {
            return {
                valid: true,
                profile: {},
                rules: [
                    (v) => !!v || app.fwkGetLabel({ key: "ERROR_FIELD_IS_REQUIRED" })
                ],
                _profile: {}
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
                    const request = this.$http.put("/services/users/current", this.profile);
                    app.fwkCallService(request).then((response) => {
                        this._setProfile(response.body.data.user);
                        app.fwkGetEventBus().emit("PROFILE_CHANGED", response.body.data.user);
                    }, () => {
                        // TODO manage
                    });
                }
            },
            hasChanges: function () {
                return !(JSON.stringify(this._profile) == JSON.stringify(this.profile));
            },
            _setProfile: function (profile) {
                this._profile = Object.assign({}, profile);
                this.profile = profile;
            },
            _refreshData: function () {
                const request = this.$http.get("/services/users/current");
                app.fwkCallService(request).then((response) => {
                    this._setProfile(response.body.data.user);
                }, () => {
                    // TODO manage
                });
            }
        }
    });
}(window.app || (window.app = {})));