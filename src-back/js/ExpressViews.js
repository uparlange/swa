// application dependencies
const Config = require(__dirname + "/Config");
const pkg = require(__dirname + "/../../package.json");

// body
const init = function (instance) {
    const viewsConf = Config.getConfig().getExpressStaticsViewsConf();
    instance.set("views", viewsConf.folder);
    instance.set("view engine", viewsConf.engine);
    viewsConf.files.forEach((file, index, array) => {
        instance.get(file.path, function (req, res) {
            res.render(file.value.split(".")[0], {
                title: pkg.name.toUpperCase(),
                vendorsConf: Config.getConfig().getExpressStaticsVendorsConf()
            });
        });
    });
};

// exported methods
exports.init = init;