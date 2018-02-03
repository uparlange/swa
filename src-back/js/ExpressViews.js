// application dependencies
const Config = require(__dirname + "/Config");
const pkg = require(__dirname + "/../../package.json");

// exported methods
exports.init = function (instance) {
    // init
    instance.set("views", Config.getConfig().srcFrontPath + "/views");
    instance.set("view engine", "pug");
    // index
    instance.get("/", function (req, res) {
        res.render("index", {
            title: pkg.name.toUpperCase(),
            vendors: Config.getConfig().expressStaticsVendors
        });
    });
}