// application dependencies
const Config = require(__dirname + "/Config");
const pkg = require(__dirname + "/../../package.json");

// body
const init = function (instance) {
    // init
    const conf = Config.getConfig().getExpressStaticsViewsConf();
    instance.set("views", conf.folder);
    instance.set("view engine", conf.engine);
    // index
    instance.get("/", function (req, res) {
        res.render("index", {
            title: pkg.name.toUpperCase(),
            vendorsConf: Config.getConfig().getExpressStaticsVendorsConf()
        });
    });
    // manifest
    instance.get("/manifest", function (req, res) {
        res.render("manifest", {
            title: pkg.name.toUpperCase()
        });
    });
};

// exported methods
exports.init = init;