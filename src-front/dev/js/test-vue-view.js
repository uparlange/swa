"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestVueView" }, {
        data: function () {
            return {
                label: "TestComponent"
            }
        }
    });
}(window.app || (window.app = {})));