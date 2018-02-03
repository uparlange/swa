// application dependencies
const PouchDB = require(__dirname + "/PouchDB");

// body
const mockData = {
    _id: "jdoe",
    firstName: "John",
    lastName: "Doe"
};
const db = PouchDB.getDatabase("users");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockData);
    }
});

// exported methods
exports.update = function (user) {
    return new Promise((resolve, reject) => {
        db.put(user).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};
exports.findById = function (id) {
    return new Promise((resolve, reject) => {
        db.get(id).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};