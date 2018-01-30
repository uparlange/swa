// external dependencies
const express = require("express");

// application dependencies
const Config = require("./Config");

// exported methods
exports.init = function (instance) {
    process.env.NODE_ENV = "production";
    const www = (process.env.NODE_ENV === "production") ? "www/prod" : "www/dev";
    instance.use(express.static(www));
    Config.getConfig().vendors.forEach((item, index, array) => {
        instance.use("/vendors", express.static(item.folder));
    });
}