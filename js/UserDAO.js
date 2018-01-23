// external dependencies
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-adapter-memory"));

// body
const mockUser = {
    "_id": "jdoe",
    "firstName": "John",
    "lastName": "Doe"
};
const db = new PouchDB("database/users", { adapter: "memory" });
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockUser);
    }
});

// exported methods
exports.findById = function (id) {
    return new Promise(function (resolve, reject) {
        db.get(id).then(function (doc) {
            resolve(doc);
        }).catch(function (err) {
            reject(err);
        });
    });
};