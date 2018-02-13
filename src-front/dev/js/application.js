"use strict";

(function (app) {
    // mixins || plugins || filters || directives || components
    app.fwkDefineFilter({ id: "zerofill" }, function (value, length) {
        return app.fwkGetStringUtils().zerofill(value, length);
    });
    app.fwkDefineFilter({ id: "dasherize" }, function (value) {
        return app.fwkGetStringUtils().dasherize(value);
    });
}(window.app || (window.app = {})));