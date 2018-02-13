"use strict";

(function (app) {
    const LABEL_ALL = "ALL";
    const LABEL_YOU = "YOU";
    let chats = null;
    app.fwkDefineDirective({ id: "AutoScroll" }, {
        bind: function (el) {
            el._mutationObserver = new MutationObserver(() => {
                el.scrollTop = el.scrollHeight;
            });
            var config = {
                childList: true
            };
            el._mutationObserver.observe(el, config);
        },
        unbind: function (el) {
            el._mutationObserver.disconnect();
        }
    });
    app.fwkDefineComponent({ id: "TestWsView" }, {
        data: function () {
            return {
                clients: [],
                clientId: null,
                message: "",
                conversation: ""
            }
        },
        watch: {
            clientId: function (newValue, oldValue) {
                this._saveConversation(oldValue);
                this.conversation = this._getConversation(newValue);
            }
        },
        beforeCreate: function () {
            chats = JSON.parse(sessionStorage.getItem("TestWsView_chats")) || {};
            setTimeout(() => {
                this.clientId = sessionStorage.getItem("TestWsView_clientId") || LABEL_ALL;
            }, 0);
        },
        created: function () {
            app.fwkLoadJs("https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.5.2/randomColor.min.js").then(() => {
                const url = null;
                const userData = { color: window.randomColor() };
                this.$socket.connect(url, userData).then(() => {
                    this._refreshClients().then(() => {

                    });
                });
            });
        },
        beforeDestroy: function () {
            this._saveConversation(this.clientId);
            sessionStorage.setItem("TestWsView_chats", JSON.stringify(chats));
            sessionStorage.setItem("TestWsView_clientId", this.clientId);
        },
        afterSocketClientAdded: function (event) {
            this._refreshClients().then(() => {
                this._addConversation(event.from, "connected");
            });
        },
        afterSocketClientRemoved: function (event) {
            this._addConversation(event.from, "disconnected");
            this._refreshClients().then(() => {
                if (this.clientId === event.from) {
                    this.clientId = LABEL_ALL;
                }
            });
        },
        afterSocketMessageReceived: function (event) {
            this.clientId = (event.to == LABEL_ALL) ? event.to : event.from;
            setTimeout(() => {
                this._addConversation(event.from, event.data);
            }, 0);
        },
        methods: {
            sendMessage: function () {
                if (this.message && this.message.length > 0) {
                    const params = {
                        data: this.message,
                        to: this.clientId
                    };
                    this.$socket.sendMessage(params).then((id) => {
                        this._addConversation(id, this.message);
                    });
                }
            },
            _getConversation: function (id) {
                return chats[id] || "";
            },
            _saveConversation: function (id) {
                chats[id] = this.conversation;
            },
            _addConversation: function (clientId, message) {
                this._getClientList().then((clients) => {
                    clients.forEach((client) => {
                        if (client.id === clientId) {
                            this.conversation += '<div style="margin-bottom:5px;color:' + client.userData.color + ';"><b>' + client.label + '</b> : ' + message + '</div>';
                            this.message = "";
                        }
                        return;
                    });
                });
            },
            _refreshClients: function () {
                return new Promise((resolve) => {
                    this._getClientList().then((clients) => {
                        this.clients = clients;
                        resolve();
                    });
                });
            },
            _getClientList: function () {
                return new Promise((resolve) => {
                    this.$socket.getClientList().then((clients) => {
                        clients.forEach((client) => {
                            client.label = client.type + " (" + client.id + ")";
                            client.disabled = (client.type == LABEL_YOU);
                        });
                        resolve(clients);
                    });
                });
            }
        }
    });
}(window.app || (window.app = {})));