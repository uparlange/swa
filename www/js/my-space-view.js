"use strict";

(function (app) {
    app.fwkRegisterRouteComponent("MySpaceView", {
        data: function () {
            return {
                items: []
            }
        },
        created: function () {
            this._refreshBreadcrumb(app.fwkGetCurrentRoute());
            this._FWK_ROUTE_CHANGED_handler = (event) => {
                this._refreshBreadcrumb(event.to);
            };
            app.fwkGetEventBus().on("FWK_ROUTE_CHANGED", this._FWK_ROUTE_CHANGED_handler);
        },
        beforeDestroy() {
            app.fwkGetEventBus().off("FWK_ROUTE_CHANGED", this._FWK_ROUTE_CHANGED_handler);
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