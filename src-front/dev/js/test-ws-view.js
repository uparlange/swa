"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "TestWsView" }, {
        data: function () {
            return {
                clients: []
            }
        },
        created: function () {
            if (!this.$socket.isConnected()) {
                this.$socket.connect();
            } else {
                this._refreshClients();
            }
        },
        afterSocketClientAdded: function () {
            this._refreshClients();
        },
        afterSocketClientRemoved: function () {
            this._refreshClients();
        },
        methods: {
            _refreshClients: function () {
                this.$socket.getClientList().then((clients) => {
                    clients.sort((v1, v2) => {
                        if (v1.type < v2.type) {
                            return 1;
                        } else if (v1.type > v2.type) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    this.clients = clients;
                });
            }
        }
    });
}(window.app || (window.app = {})));