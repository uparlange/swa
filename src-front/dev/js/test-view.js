"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestView" }, {
        data: function () {
            return {
                tabs: [
                    { label: "VUE", link: "vue" },
                    { label: "I18N", link: "i18n" },
                    { label: "WS", link: "ws" }
                ]
            }
        }
    });
}(window.app || (window.app = {})));