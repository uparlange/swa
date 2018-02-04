// external dependencies
const bcrypt = require("bcryptjs");

// application dependencies
const PouchDB = require(__dirname + "/PouchDB");

// body
const salt = 10;
const db = PouchDB.getDatabase("credentials");

const getInfos = function () {
    return new Promise(function (resolve, reject) {
        db.info().then(function (result) {
            resolve(result);
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const add = function (login, password) {
    return new Promise(function (resolve, reject) {
        db.find({
            selector: { login: (login || "") }
        }).then(function (res) {
            const credential = res.docs[0];
            if (credential) {
                reject({ message: "LOGIN_ALREADY_EXISTS" });
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    db.post({ login: login, password: hash }).then(function (res) {
                        resolve(res);
                    }).catch(function (err) {
                        reject({ message: "TECHNICAL_ERROR" });
                    });
                });
            }
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

const findByLoginAndPassord = function (login, password) {
    return new Promise(function (resolve, reject) {
        db.find({
            selector: { login: (login || "") }
        }).then(function (res) {
            const credential = res.docs[0];
            if (credential) {
                bcrypt.compare(password, credential.password, function (err, res) {
                    if (res) {
                        resolve(credential);
                    } else {
                        reject({ message: "INVALID_LOGIN_OR_PASSWORD" });
                    }
                });
            } else {
                reject({ message: "INVALID_LOGIN_OR_PASSWORD" });
            }
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};

getInfos().then(function (infos) {
    if (infos.doc_count === 0) {
        db.put({
            _id: "jdoe",
            login: "j.doe@lost.com",
            password: "$2a$10$aAT021Qzwenl3CvMyMGg3OSkWuiODkAMbeGLNurMaNpCtH2bqUDHO"
        })
    }
});

// exported methods
exports.getInfos = getInfos;
exports.add = add;
exports.findByLoginAndPassord = findByLoginAndPassord;