// external dependencies
const express = require("express");

// application dependencies
const Config = require(__dirname + "/Config");

// exported methods
exports.init = function (instance) {
    // www
    const www = Config.getConfig().srcFrontPath + ((process.env.NODE_ENV === "production") ? "/prod" : "/dev");
    instance.use(express.static(www));
    // locales
    const esl = Config.getConfig().expressStaticsLocales;
    instance.use(esl.path, express.static(esl.folder));
    // vendors
    const esv = Config.getConfig().expressStaticsVendors;
    esv.forEach((vendor, index, array) => {
        instance.use(vendor.path, express.static(vendor.folder));
    });
}