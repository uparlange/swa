"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestI18nView" }, {
        data: function () {
            return {
                locales: [],
                selectedLocale: app.fwkGetCurrentLocale()
            }
        },
        watch: {
            selectedLocale: function () {
                app.fwkGetSetLocale(this.selectedLocale);
            }
        },
        created: function () {
            const request = this.$http.get("/services/locales");
            app.fwkCallService(request).then((response) => {
                this.locales = response.body.data.locales;
            }, () => {
                // TODO manage error
            });
        }
    });
}(window.app || (window.app = {})));