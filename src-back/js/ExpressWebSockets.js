// body
const LABEL_ALL = "ALL";
const LABEL_YOU = "YOU";
const LABEL_OTHER = "OTHER";
const userDatas = {};
const getUserData = function (id) {
    return userDatas[id] || {};
};
const getMessage = function (from, to, data) {
    return { from: from, to: to, data: data, userData: getUserData(from) };
};
const getClient = function (id, type) {
    return { id: id, type: type, userData: getUserData(id) };
};
const init = function (instance) {
    instance.on("connection", function (socket) {
        // FWK_WS_CLIENT_ADDED
        instance.emit("FWK_WS_CLIENT_ADDED", getMessage(socket.id, LABEL_ALL));
        // FWK_WS_GET_CLIENT_LIST
        socket.on("FWK_WS_GET_CLIENT_LIST", function (event, callback) {
            const clients = [];
            instance.clients((error, response) => {
                response.forEach(element => {
                    const type = (element === socket.id) ? LABEL_YOU : LABEL_OTHER;
                    clients.push(getClient(element, type));
                });
                clients.unshift(getClient(LABEL_ALL, LABEL_ALL));
                callback(clients);
            });
        });
        // FWK_WS_SET_USER_DATA
        socket.on("FWK_WS_SET_USER_DATA", function (event, callback) {
            userDatas[socket.id] = event;
            callback();
        });
        // FWK_WS_SEND_MESSAGE
        socket.on("FWK_WS_SEND_MESSAGE", function (event, callback) {
            callback(socket.id);
            if (event.to == LABEL_ALL) {
                instance.clients((error, clients) => {
                    clients.forEach(id => {
                        if (id !== socket.id) {
                            instance.to(id).emit("FWK_WS_MESSAGE_RECEIVED", getMessage(socket.id, event.to, event.data));
                        }
                    });
                });
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