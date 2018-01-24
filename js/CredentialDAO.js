// external dependencies
const bcrypt = require("bcryptjs");

// application dependencies
const PouchDB = require("./PouchDB");

// body
const mockData = {
    _id: "jdoe",
    login: "j.doe@lost.com",
    password: "$2a$10$7.yf3sjW8Vc1tesHhqrDx.EwQmj4PhVnXl3eethCw0LudtDmacW6S"
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
            selector: { login: (login || "") }
        }).then(function (result) {
            const credential = result.docs[0];
            if (credential) {
                bcrypt.compare(password, credential.password, (err, res) => {
                    resolve(res ? credential : undefined);
                });
            } else {
                resolve(undefined);
            }
        }).catch(function (err) {
            reject(err);
        });
    });
};