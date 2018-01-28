"use strict";

(function (app) {
    app.Fwk.manager.ComponentManager.register("MySpaceView", {
        data: function () {
            return {
                items: []
            }
        },
        created: function () {
            this._refreshBreadcrumb(this.fwkGetCurrentRoute());
            this._FWK_ROUTE_CHANGED_handler = (event) => {
                this._refreshBreadcrumb(event.to);
            };
            this.fwkGetEventBus().on("FWK_ROUTE_CHANGED", this._FWK_ROUTE_CHANGED_handler);
        },
        beforeDestroy() {
            this.fwkGetEventBus().off("FWK_ROUTE_CHANGED", this._FWK_ROUTE_CHANGED_handler);
        },
        methods: {
            _refreshBreadcrumb: function (path) {
                const items = [];
                let bcPath = null;
                path.substring(1).split("/").forEach((element) => {
                    bcPath = "/" + element;
                    items.push({
                        label: element,
                        link: bcPath
                    })
                });
                this.items = items;
            }
        }
    });
}(window.app || (window.app = {})));    