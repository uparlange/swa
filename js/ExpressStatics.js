// external dependencies
const express = require("express");

// exported methods
exports.init = function (instance) {
    const www = (process.env.NODE_ENV === "production") ? "www/prod" : "www/dev";
    instance.use(express.static(www));
    instance.use("/vendors", express.static("node_modules/vuetify/dist"));
    instance.use("/vendors", express.static("node_modules/vue/dist"));
    instance.use("/vendors", express.static("node_modules/vue-router/dist"));
    instance.use("/vendors", express.static("node_modules/vue-resource/dist"));
    instance.use("/vendors", express.static("node_modules/vue-i18n/dist"));
}