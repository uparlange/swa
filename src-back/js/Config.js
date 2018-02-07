// body
const JSON_CONFIG = require(__dirname + "/../data/config.json");
const PROD_MODE = (process.env.NODE_ENV === "production");
const SRC_BACK_PATH = __dirname + "/../../src-back";
const SRC_FRONT_PATH = __dirname + "/../../src-front";

const config = {
    getExpressPort: function () {
        return process.env.PORT || JSON_CONFIG.expressPort;
    },
    getExpressWwwFolder: function () {
        return SRC_FRONT_PATH + (PROD_MODE ? "/prod" : "/dev");
    },
    getExpressViewsConf: function () {
        return {
            engine: "pug",
            folder: SRC_FRONT_PATH + "/views"
        };
    },
    getExpressStaticsLocales: function () {
        return JSON_CONFIG.expressStaticsLocales;
    },
    getExpressStaticsVendors: function () {
        return JSON_CONFIG.expressStaticsVendors;
    },
    getPassportSecretOrKey: function () {
        return JSON_CONFIG.passportSecretOrKey;
    },
    getPouchDbAdapter: function () {
        return PROD_MODE ? "memory" : "websql";
    }
};

const getConfig = function () {
    return config;
};

// exported methods
exports.getConfig = getConfig;