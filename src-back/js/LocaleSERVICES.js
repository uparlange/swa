// application dependencies
const Config = require(__dirname + "/Config");

// body
const init = function (instance, AUTHENTICATED_SERVICE) {
    instance.get("/services/locales", function (req, res) {
        const locales = [];
        Config.getConfig().getExpressStaticsLocalesConf().files.forEach(function (file) {
            locales.push(file.replace(".json", ""));
        });
        res.json({
            message: "OK",
            data: {
                locales: locales
            }
        });
    });
};

// exported methods
exports.init = init;