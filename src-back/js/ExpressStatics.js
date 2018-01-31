// external dependencies
const express = require("express");

// application dependencies
const Config = require("./Config");

// exported methods
exports.init = function (instance) {
    const www = (process.env.NODE_ENV === "production") ? "src-front/prod" : "src-front/dev";
    instance.use(express.static(www));
    Config.getConfig().expressStaticsVendors.forEach((item, index, array) => {
        instance.use("/vendors", express.static(item.folder));
    });
}