// external dependencies
const jwt = require("jsonwebtoken");

// application dependencies
const Passport = require("./Passport");
const CredentialDAO = require("./CredentialDAO");
const UserDAO = require("./UserDAO");
const EventDAO = require("./EventDAO");

// exported methods
exports.init = function (instance) {
    // common
    instance.post("/services/register", (req, res) => {
        CredentialDAO.add(req.body.login, req.body.password).then((credential) => {
            UserDAO.update({ _id: credential.id, firstName: req.body.login, lastName: "" }).then((user) => {
                res.json({
                    message: "OK",
                    data: {
                        user: user
                    }
                });
            }, (err) => {
                res.status(400).json(err);
            });
        }, (err) => {
            res.status(400).json(err);
        })
    });
    instance.post("/services/login", (req, res) => {
        CredentialDAO.findByLoginAndPassord(req.body.login, req.body.password).then((credential) => {
            const payload = {
                id: credential._id,
                exp: Math.floor(Date.now() / 1000) + (60 * 60) //1 hour
            };
            const token = jwt.sign(payload, Passport.SECRET_OR_KEY);
            UserDAO.findById(payload.id).then((user) => {
                res.json({
                    message: "OK",
                    data: {
                        token: token,
                        user: user
                    }
                });
            }, (err) => {
                res.status(401).json(err);
            });
        }, (err) => {
            res.status(401).json(err);
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