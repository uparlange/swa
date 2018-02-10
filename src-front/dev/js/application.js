"use strict";

(function (app) {
    // mixins
    app.fwkDefineMixin({ id: "TestMixin" }, {
        data: function () {
            return {
                label: "TestComponent"
            }
        }
    });
    // plugins

    // filters
    app.fwkDefineFilter({ id: "zerofill" }, function (value, length) {
        return app.fwkGetStringUtils().zerofill(value, length);
    });
    app.fwkDefineFilter({ id: "dasherize" }, function (value) {
        return app.fwkGetStringUtils().dasherize(value);
    });
    // directives
    app.fwkDefineDirective({ id: "TestDirective" }, {
        bind: function (el) {
            el._onClickHandler = () => {
                alert("TestDirective");
            };
            el.addEventListener("click", el._onClickHandler, false);
        },
        unbind: function (el) {
            el.removeEventListener("click", el._onClickHandler);
        }
    });
    // components
    app.fwkUseComponent({ id: "TestComponent" });
}(window.app || (window.app = {})));