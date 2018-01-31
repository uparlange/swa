// external dependencies
const bcrypt = require("bcryptjs");

// application dependencies
const PouchDB = require("./PouchDB");

// body
const salt = 10;
const mockData = {
    _id: "jdoe",
    login: "j.doe@lost.com",
    password: "$2a$10$aAT021Qzwenl3CvMyMGg3OSkWuiODkAMbeGLNurMaNpCtH2bqUDHO"
};
const db = PouchDB.getDatabase("db/credentials");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.put(mockData);
    }
});

// exported methods
exports.add = function (login, password) {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { login: (login || "") }
        }).then((res) => {
            const credential = res.docs[0];
            if (credential) {
                reject({ message: "LOGIN_ALREADY_EXISTS" });
            } else {
                bcrypt.hash(password, salt, (err, hash) => {
                    db.post({ login: login, password: hash }).then((res) => {
                        resolve(res);
                    }).catch((err) => {
                        reject({ message: "TECHNICAL_ERROR" });
                    });
                });
            }
        }).catch((err) => {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};
exports.findByLoginAndPassord = function (login, password) {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { login: (login || "") }
        }).then((res) => {
            const credential = res.docs[0];
            if (credential) {
                bcrypt.compare(password, credential.password, (err, res) => {
                    if (res) {
                        resolve(credential);
                    } else {
                        reject({ message: "INVALID_LOGIN_OR_PASSWORD" });
                    }
                });
            } else {
                reject({ message: "INVALID_LOGIN_OR_PASSWORD" });
            }
        }).catch((err) => {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};