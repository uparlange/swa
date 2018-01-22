// external dependencies
const express = require("express");

// exported methods
exports.init = function (instance) {
    instance.use(express.static("www"));
    instance.use("/node_modules/vuetify/dist", express.static("node_modules/vuetify/dist"));
    instance.use("/node_modules/vue/dist", express.static("node_modules/vue/dist"));
    instance.use("/node_modules/vue-router/dist", express.static("node_modules/vue-router/dist"));
    instance.use("/node_modules/vue-resource/dist", express.static("node_modules/vue-resource/dist"));
    instance.use("/node_modules/vue-i18n/dist", express.static("node_modules/vue-i18n/dist"));
}