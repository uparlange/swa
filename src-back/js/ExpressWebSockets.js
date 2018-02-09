// body
const sockets = {};
const init = function (instance) {
    instance.on("connection", function (socket) {
        instance.emit("FWK_WS_CLIENT_ADDED", socket.id);
        socket.on("disconnect", function (reason) {
            instance.emit("FWK_WS_CLIENT_REMOVED", socket.id);
        });
        socket.on("FWK_WS_GET_CLIENT_LIST", function (data, callback) {
            instance.clients((error, clients) => {
                if (error) throw error;
                callback(clients);
            });
        });
    });
};

// exported methods
exports.init = init;   