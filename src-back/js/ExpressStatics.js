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
    const esl = Config.getConfig().getExpressStaticsLocales();
    instance.use(esl.path, express.static(esl.folder));
    // vendors
    const esv = Config.getConfig().getExpressStaticsVendors();
    esv.forEach(function (vendor, index, array) {
        instance.use(vendor.path, express.static(vendor.folder));
    });
};

// exported methods
exports.init = init;