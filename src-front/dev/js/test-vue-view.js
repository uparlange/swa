"use strict";

(function (app) {
    app.fwkUseComponent({ id: "TestComponent" });
    app.fwkDefineMixin({ id: "TestMixin" }, {
        data: function () {
            return {
                label: "TestComponent"
            }
        }
    });
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
    app.fwkDefineComponent({ id: "TestVueView" }, {
        mixins: [
            app.fwkUseMixin({ id: "TestMixin" })
        ]
    });
}(window.app || (window.app = {})));