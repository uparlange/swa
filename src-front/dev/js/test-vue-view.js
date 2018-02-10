"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestVueView" }, {
        mixins: [
            app.fwkUseMixin({ id: "TestMixin" })
        ]
    });
}(window.app || (window.app = {})));