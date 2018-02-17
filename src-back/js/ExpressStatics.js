// external dependencies
const express = require("express");

// application dependencies
const Config = require(__dirname + "/Config");

// body
const init = function (instance) {
    // www
    const www = Config.getConfig().getExpressWwwFolder();
    instance.use(express.static(www));
    // locales
    const localesConf = Config.getConfig().getExpressStaticsLocalesConf();
    instance.use(localesConf.path, express.static(localesConf.folder));
    // vendors
    const vendorsConf = Config.getConfig().getExpressStaticsVendorsConf();
    vendorsConf.vendors.forEach(function (vendor, index, array) {
        instance.use(vendorsConf.path, express.static(vendor.folder));
    });
};

// exported methods
exports.init = init;