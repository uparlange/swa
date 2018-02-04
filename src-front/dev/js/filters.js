"use strict";

(function (app) {
    app.fwkDefineFilter("zerofill", function (value, length) {
        return app.fwkGetStringUtils().zerofill(value, length);
    });
    app.fwkDefineFilter("dasherize", function (value) {
        return app.fwkGetStringUtils().dasherize(value);
    });
}(window.app || (window.app = {})));