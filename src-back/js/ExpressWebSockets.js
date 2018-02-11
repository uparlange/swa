// body
const LABEL_ALL = "ALL";
const LABEL_YOU = "YOU";
const LABEL_OTHER = "OTHER";
const getMessage = function (from, to, data) {
    return { from: from, to: to, data: data };
};
const init = function (instance) {
    instance.on("connection", function (socket) {
        // connect
        instance.emit("FWK_WS_CLIENT_ADDED", getMessage(socket.id, LABEL_ALL));
        // events
        socket.on("FWK_WS_GET_CLIENT_LIST", function (event, callback) {
            const clients = [];
            instance.clients((error, response) => {
                response.forEach(element => {
                    const type = (element === socket.id) ? LABEL_YOU : LABEL_OTHER;
                    const label = type + " (" + element + ")";
                    clients.push({ id: element, type: type, label: label });
                });
                clients.unshift({ id: LABEL_ALL, type: LABEL_ALL, label: LABEL_ALL });
                callback(clients);
            });
        });
        socket.on("FWK_WS_SEND_MESSAGE", function (event, callback) {
            callback(socket.id);
            if (event.to == LABEL_ALL) {
                for (id in instance.sockets.connected) {
                    if (id !== socket.id) {
                        instance.to(id).emit("FWK_WS_MESSAGE_RECEIVED", getMessage(socket.id, event.to, event.data));
                    }
                }
            } else {
                instance.to(event.to).emit("FWK_WS_MESSAGE_RECEIVED", getMessage(socket.id, event.to, event.data));
            }
        });
        // disconnect
        socket.on("disconnect", function (reason) {
            instance.emit("FWK_WS_CLIENT_REMOVED", getMessage(socket.id, LABEL_ALL));
        });
    });
};

// exported methods
exports.init = init;   