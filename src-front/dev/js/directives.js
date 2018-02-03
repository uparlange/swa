"use strict";

(function (app) {
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
}(window.app || (window.app = {})));