// application dependencies
const PouchDB = require(__dirname + "/PouchDB");

// body
const db = PouchDB.getDatabase("users");

const getInfos = function () {
    return new Promise(function (resolve, reject) {
        db.info().then(function (result) {
            resolve(result);
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const getById = function (id) {
    return new Promise(function (resolve, reject) {
        db.get(id).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const update = function (user) {
    return new Promise(function (resolve, reject) {
        db.put(user).then(function (res) {
            getById(res.id).then(function (res) {
                resolve(res);
            }).catch(function (err) {
                reject({ message: "TECHNICAL_ERROR" });
            });
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

getInfos().then(function (infos) {
    if (infos.doc_count === 0) {
        db.put({
            _id: "jdoe",
            firstName: "John",
            lastName: "Doe"
        })
    }
});

// exported methods
exports.getInfos = getInfos;
exports.update = update;
exports.getById = getById;