"use strict";

(function (app) {
    // uses
    app.fwkUseComponent({ id: "TestComponent" });
    // defines
    app.fwkDefineDirective({ id: "TestDirective" }, {
        bind: function (el) {
            el._onClickHandler = (event) => {
                alert("TestDirective - Page 2");
            };
            el.addEventListener("click", el._onClickHandler, false);
        },
        unbind: function (el) {
            el.removeEventListener("click", el._onClickHandler);
        }
    });
    app.fwkDefineComponent({ id: "Test2View" }, {
        data: function () {
            return {
                label: "TestComponent - Page 2"
            }
        }
    });
}(window.app || (window.app = {})));