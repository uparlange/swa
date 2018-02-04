// application dependencies
const PouchDB = require(__dirname + "/PouchDB");

// body
const db = PouchDB.getDatabase("events");

const getDateFromISOString = function (dateISOString) {
    return dateISOString.split("T")[0];
};

const getDateFromDatetime = function (date) {
    return getDateFromISOString(date.toISOString());
};

const getInfos = function () {
    return new Promise(function (resolve, reject) {
        db.info().then(function (response) {
            resolve(response);
        }).catch(function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const get = function (id) {
    return new Promise(function (resolve, reject) {
        db.get(id).then(function (response) {
            resolve(response);
        }).catch(function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const getFindRequest = function (userId, params) {
    const request = {
        selector: {
            userId: (userId || "")
        }
    };
    if (params.date) {
        const today = getDateFromISOString(params.date);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        request.selector.date = { $gte: today, $lt: getDateFromDatetime(tomorrow) };
        if (!request.sort) {
            request.sort = [];
        }
        request.sort.push({ date: "desc" });
    }
    if (params.id) {
        request.selector._id = (params.id || "");
    }
    return request;
};

const find = function (userId, params) {
    return new Promise(function (resolve, reject) {
        db.find(getFindRequest(userId, params)).then(function (response) {
            resolve(response.docs);
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const remove = function (userId, eventId) {
    return new Promise(function (resolve, reject) {
        find(userId, { id: eventId }).then(function (response) {
            db.remove(response[0]).then(function (response) {
                resolve(response);
            }).catch(function (response) {
                reject({ message: "TECHNICAL_ERROR" });
            });
        }).catch(function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const update = function (userId, event) {
    return new Promise(function (resolve, reject) {
        db.put(event).then(function (response) {
            resolve(response);
        }).catch(function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const create = function (userId, event) {
    event.userId = userId;
    return new Promise(function (resolve, reject) {
        db.post(event).then(function (response) {
            resolve(response);
        }).catch(function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const save = function (userId, event) {
    return new Promise(function (resolve, reject) {
        const method = (event._id && event._rev) ? update : create;
        method(userId, event).then(function (response) {
            resolve(response);
        }, function (response) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

getInfos().then(function (infos) {
    if (infos.doc_count === 0) {
        db.createIndex({
            index: {
                fields: ["date"]
            }
        }).then(function () {
            db.bulkDocs([
                { userId: "jdoe", date: new Date().toISOString(), icon: "card_giftcard", title: "Wife's birthday !", description: "" },
                { userId: "jdoe", date: new Date().toISOString(), icon: "note", title: "Go down the trash cans", description: "" }
            ]);
        })
    }
});

// exported methods
exports.getInfos = getInfos;
exports.remove = remove;
exports.find = find;
exports.save = save;