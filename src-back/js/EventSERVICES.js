// application dependencies
const Config = require(__dirname + "/Config");
const EventDAO = require(__dirname + "/EventDAO");

// body
const init = function (instance, AUTHENTICATED_SERVICE) {
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
    instance.get("/services/events", AUTHENTICATED_SERVICE, function (req, res) {
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
    instance.delete("/services/events", AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.remove(req.user._id, req.query.id).then(function (response) {
            res.json({
                message: "OK"
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
    instance.put("/services/events", AUTHENTICATED_SERVICE, function (req, res) {
        EventDAO.save(req.user._id, req.body).then(function (response) {
            res.json({
                message: "OK"
            });
        }, function (response) {
            res.status(400).json(response);
        });
    });
};

// exported methods
exports.init = init;