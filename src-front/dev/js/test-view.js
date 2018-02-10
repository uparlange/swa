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
        },
        methods: {
            showTab: function (tab) {
                app.fwkNavigate(tab.link);
            }
        }
    });
}(window.app || (window.app = {})));