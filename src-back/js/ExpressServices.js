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
    // common
    instance.post("/services/register", function (req, res) {
        CredentialDAO.add(req.body.login, req.body.password).then((credential) => {
            UserDAO.update({ _id: credential.id, firstName: req.body.login, lastName: "" }).then((user) => {
                res.json({
                    message: "OK"
                });
            }, (err) => {
                res.status(400).json(err);
            });
        }, (err) => {
            res.status(400).json(err);
        })
    });
    instance.post("/services/login", function (req, res) {
        CredentialDAO.findByLoginAndPassord(req.body.login, req.body.password).then((credential) => {
            const payload = {
                id: credential._id,
                exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
            };
            const token = jwt.sign(payload, Passport.SECRET_OR_KEY);
            UserDAO.findById(payload.id).then((user) => {
                res.json({
                    message: "OK",
                    data: {
                        token: token
                    }
                });
            }, (err) => {
                res.status(401).json(err);
            });
        }, (err) => {
            res.status(401).json(err);
        });
    });
    // locales
    instance.get("/services/locales", function (req, res) {
        const locales = [];
        Config.getConfig().expressStaticsLocales.files.forEach((file) => {
            locales.push(file.replace(".json", ""));
        });
        res.json({
            message: "OK",
            data: {
                locales: locales
            }
        });
    });
    // user
    instance.get("/services/user", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        res.json({
            message: "OK",
            data: {
                user: req.user
            }
        });
    });
    // events
    instance.get("/services/events", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.findByUserAndDate(req.user._id, req.query.date).then((events) => {
            res.json({
                message: "OK",
                data: {
                    events: events
                }
            });
        }, (err) => {
            res.status(400).json(err);
        });
    });
}