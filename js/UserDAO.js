// external dependencies
const PouchDB = require("pouchdb");

// body
const mockUser = {
    "_id": "jdoe",
    "firstName": "John",
    "lastName": "Doe"
};
const db = new PouchDB("database/users");
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