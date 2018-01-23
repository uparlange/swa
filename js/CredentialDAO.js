// application dependencies
const PouchDB = require("./PouchDB");

// body
const mockData = {
    _id: "jdoe",
    login: "login",
    password: "password"
};
const db = PouchDB.getDatabase("db/credentials");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockData);
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