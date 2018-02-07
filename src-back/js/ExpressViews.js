// application dependencies
const Config = require(__dirname + "/Config");
const pkg = require(__dirname + "/../../package.json");

// body
const init = function (instance) {
    // init
    const conf = Config.getConfig().getExpressViewsConf();
    instance.set("views", conf.folder);
    instance.set("view engine", conf.engine);
    // index
    instance.get("/", function (req, res) {
        res.render("index", {
            title: pkg.name.toUpperCase(),
            vendors: Config.getConfig().getExpressStaticsVendors()
        });
    });
};

// exported methods
exports.init = init;