// application dependencies
const PouchDB = require("./PouchDB");

// body
const mockData = {
    _id: "jdoe",
    firstName: "John",
    lastName: "Doe"
};
const db = PouchDB.getDatabase("db/users");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockData);
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