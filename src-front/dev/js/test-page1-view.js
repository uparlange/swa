"use strict";

(function (app) {
    // components
    app.fwkUseComponent({ id: "TestComponent" });
    app.fwkDefineComponent({ id: "TestPage1View" }, {
        data: function () {
            return {
                label: "TestComponent"
            }
        }
    });
    // directives
    app.fwkDefineDirective({ id: "TestDirective" }, {
        bind: function (el) {
            el._onClickHandler = () => {
                alert("TestDirective - Page 1");
            };
            el.addEventListener("click", el._onClickHandler, false);
        },
        unbind: function (el) {
            el.removeEventListener("click", el._onClickHandler);
        }
    });
    // filters
    app.fwkDefineFilter("dasherize", function (value) {
        if (!value) return "";
        return value.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase().substring(1);
    });
}(window.app || (window.app = {})));