// external dependencies
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));

// body
const mockUser = {
    "_id": "jdoe",
    "login": "login",
    "password": "password"
};
const db = new PouchDB("database/credentials");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockUser);
    }
});

// exported methods
exports.findByLoginAndPassord = function (login, password) {
    return new Promise(function (resolve, reject) {
        db.find({
            selector: { login: (login || ""), password: (password || "") }
        }).then(function (result) {
            resolve(result.docs[0]);
        }).catch(function (err) {
            reject(err);
        });
    });
};