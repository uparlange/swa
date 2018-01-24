// external dependencies
const jwt = require("jsonwebtoken");

// application dependencies
const Passport = require("./Passport");
const CredentialDAO = require("./CredentialDAO");
const UserDAO = require("./UserDAO");
const EventDAO = require("./EventDAO");

// exported methods
exports.init = function (instance) {
    // post
    instance.post("/services/login", (req, res) => {
        CredentialDAO.findByLoginAndPassord(req.body.login, req.body.password).then((credential) => {
            if (credential) {
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
                });
            } else {
                res.status(401).json({
                    message: "INVALID_LOGIN_OR_PASSWORD"
                });
            }
        });
    });
    // get
    instance.get("/services/profile", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        res.json({
            message: "OK",
            data: {
                user: req.user
            }
        });
    });
    instance.get("/services/events", Passport.AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.findByUserAndDate(req.user._id, req.query.date).then((events) => {
            res.json({
                message: "OK",
                data: {
                    events: events
                }
            });
        });
    });
}