"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "MySpaceView" }, {
        data: function () {
            return {
                items: []
            }
        },
        created: function () {
            this._refreshBreadcrumb(app.fwkGetCurrentRoute().fullPath);
        },
        beforeRouteUpdate(to, from, next) {
            this._refreshBreadcrumb(to.fullPath);
            next();
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