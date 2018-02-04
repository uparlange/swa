// external dependencies
const jwt = require("jsonwebtoken");
const fs = require("fs");

// application dependencies
const Passport = require(__dirname + "/Passport");
const CredentialDAO = require(__dirname + "/CredentialDAO");
const UserDAO = require(__dirname + "/UserDAO");
const EventDAO = require(__dirname + "/EventDAO");
const Config = require(__dirname + "/Config");

// exported methods
exports.init = function (instance) {
    // locales
    instance.get("/services/locales", function (req, res) {
        const locales = [];
        Config.getConfig().expressStaticsLocales.files.forEach(function (file) {
            locales.push(file.replace(".json", ""));
        });
        res.json({
            message: "OK",
            data: {
                locales: locales
            }
        });
    });
    // users
    instance.get("/services/users/infos", function (req, res) {
        UserDAO.getInfos().then(function (infos) {
            res.json({
                message: "OK",
                data: {
                    infos: infos
                }
            });
        }, function (err) {
            res.status(400).json(err);
        });
    });
    instance.post("/services/users/login", function (req, res) {
        CredentialDAO.findByLoginAndPassord(req.body.login, req.body.password).then(function (credential) {
            const payload = {
                id: credential._id,
                exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
            };
            const token = jwt.sign(payload, Passport.SECRET_OR_KEY);
            UserDAO.getById(payload.id).then(function (user) {
                res.json({
                    message: "OK",
                    data: {
                        token: token,
                        user: user
                    }
                });
            }, function (err) {
                res.status(401).json(err);
            });
        }, function (err) {
            res.status(401).json(err);
        });
    });
    instance.post("/services/users/register", function (req, res) {
        CredentialDAO.add(req.body.login, req.body.password).then(function (credential) {
            UserDAO.update({ _id: credential.id, firstName: req.body.login, lastName: "" }).then(function (user) {
                res.json({
                    message: "OK"
                });
            }, function (err) {
                res.status(400).json(err);
            });
        }, function (err) {
            res.status(400).json(err);
        })
    });
    instance.get("/services/users/current", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        res.json({
            message: "OK",
            data: {
                user: req.user
            }
        });
    });
    instance.put("/services/users/current", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        UserDAO.update(req.body).then(function (user) {
            res.json({
                message: "OK",
                data: {
                    user: user
                }
            });
        }, function (err) {
            res.status(400).json(err);
        });
    });
    // events
    instance.get("/services/events/infos", function (req, res) {
        EventDAO.getInfos().then(function (response) {
            res.json({
                message: "OK",
                data: {
                    infos: response
                }
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
    instance.get("/services/events", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.find(req.user._id, req.query).then(function (response) {
            res.json({
                message: "OK",
                data: {
                    events: response
                }
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
    instance.delete("/services/events", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.remove(req.user._id, req.query.id).then(function (response) {
            res.json({
                message: "OK"
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
    instance.put("/services/events", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.save(req.user._id, req.body).then(function (response) {
            res.json({
                message: "OK"
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
}