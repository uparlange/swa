"use strict";

(function (app) {
    let chats = null;
    let previousClientId = null;
    app.fwkDefineComponent({ id: "TestWsView" }, {
        data: function () {
            return {
                clients: [],
                clientId: null,
                conversation: "",
                message: ""
            }
        },
        watch: {
            clientId: function () {
                this._selectChat(this.clientId);
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
        afterSocketClientRemoved: function (event) {
            this._refreshClients();
            if (this.clientId === event.from) {
                this._selectChat("ALL");
            }
        },
        afterSocketMessageReceived: function (event) {
            this._selectChat((event.to == "ALL") ? event.to : event.from);
            this.addConversation(event.from, event.data);
        },
        methods: {
            addConversation: function (clientId, message) {
                this.clients.forEach((client) => {
                    if (client.id === clientId) {
                        this.conversation += '<div style="margin-bottom:5px"><b>' + client.label + '</b> : ' + message + '</div>';
                        this.message = "";
                    }
                    return;
                });
            },
            sendMessage: function () {
                const params = {
                    data: this.message,
                    to: this.clientId
                };
                this.$socket.sendMessage(params).then((id) => {
                    this.addConversation(id, this.message);
                });
            },
            _getChat: function (id) {
                if (chats == null) {
                    chats = {};
                }
                if (chats[id] == null) {
                    chats[id] = { conversation: "", message: "" };
                }
                return chats[id];
            },
            _selectChat: function (id) {
                // save current values
                const currentChat = this._getChat(previousClientId);
                currentChat.conversation = this.conversation;
                currentChat.message = this.message;
                // set new values
                const nextChat = this._getChat(id);
                this.conversation = nextChat.conversation;
                this.message = nextChat.message;
                // set selection
                this.clientId = id;
                // set previous
                previousClientId = id;
            },
            _refreshClients: function () {
                this.$socket.getClientList().then((clients) => {
                    this.clients = clients;
                    if (this.clientId == null) {
                        this._selectChat("ALL");
                    }
                });
            }
        }
    });
}(window.app || (window.app = {})));