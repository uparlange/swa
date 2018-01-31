// application dependencies
const Config = require("./Config");
const pkg = require("./../../package.json");

// exported methods
exports.init = function (instance) {
    // init
    instance.set("views", "./src-front/views");
    instance.set("view engine", "pug");
    // index
    instance.get("/", function (req, res) {
        res.render("index", {
            title: pkg.name.toUpperCase(),
            vendors: Config.getConfig().expressStaticsVendors
        });
    });
}