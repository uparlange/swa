"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestComponent" }, {
        props: ["label", "index"],
        data: function () {
            return {
                fontWeight: "normal"
            }
        }
    });
}(window.app || (window.app = {})));