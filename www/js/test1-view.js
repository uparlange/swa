"use strict";

(function (app) {
    // uses
    app.fwkUseComponent({ id: "TestComponent" });
    // defines
    app.fwkDefineDirective({ id: "TestDirective" }, {
        bind: function (el) {
            el._onClickHandler = (event) => {
                alert("TestDirective - Page 1")
            };
            el.addEventListener("click", el._onClickHandler, false);
        },
        unbind: function (el) {
            el.removeEventListener("click", el._onClickHandler);
        }
    });
    app.fwkDefineComponent({ id: "Test1View" }, {
        data: function () {
            return {
                label: "TestComponent - Page 1"
            }
        }
    });
}(window.app || (window.app = {})));