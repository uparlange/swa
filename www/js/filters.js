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
}(window.app || (window.app = {})));