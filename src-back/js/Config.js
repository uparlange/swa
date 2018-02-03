// exported methods
exports.getConfig = function () {
    const config = require(__dirname + "/../data/config.json");
    config.srcBackPath = __dirname + "/../../src-back";
    config.srcFrontPath = __dirname + "/../../src-front";
    return config;
}