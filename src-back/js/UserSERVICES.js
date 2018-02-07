// external dependencies
const jwt = require("jsonwebtoken");

// application dependencies
const Config = require(__dirname + "/Config");
const UserDAO = require(__dirname + "/UserDAO");
const CredentialDAO = require(__dirname + "/CredentialDAO");

// body
const init = function (instance, AUTHENTICATED_SERVICE) {
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
            const token = jwt.sign(payload, Config.getConfig().getPassportSecretOrKey());
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
    instance.get("/services/users/current", AUTHENTICATED_SERVICE, function (req, res) {
        res.json({
            message: "OK",
            data: {
                user: req.user
            }
        });
    });
    instance.put("/services/users/current", AUTHENTICATED_SERVICE, function (req, res) {
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
};

// exported methods
exports.init = init;