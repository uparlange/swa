"use strict";

(function (app) {
    app.fwkDefineFilter("zerofill", function (value, length) {
        if (!value) return "";
        let v = "" + value;
        while (v.length < length) {
            v = "0" + v;
        }
        return v;
    });
    app.fwkDefineFilter("dasherize", function (value) {
        if (!value) return "";
        return value.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
    });
}(window.app || (window.app = {})));