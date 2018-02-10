// external dependencies
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const http = require("http");
const io = require("socket.io");

// application dependencies
const Passport = require(__dirname + "/Passport");
const ExpressStatics = require(__dirname + "/ExpressStatics");
const ExpressServices = require(__dirname + "/ExpressServices");
const ExpressViews = require(__dirname + "/ExpressViews");
const ExpressWebSockets = require(__dirname + "/ExpressWebSockets");
const Config = require(__dirname + "/Config");

// body
let expressInstance = null;
let socketInstance = null;
const getInstance = function () {
    return expressInstance;
};
const getSocketInstance = function () {
    return socketInstance;
};
const start = function () {
    // init express
    expressInstance = express();
    expressInstance.use(Passport.getInstance().initialize());
    expressInstance.use(bodyParser.urlencoded({ extended: true }));
    expressInstance.use(bodyParser.json());
    expressInstance.use(compression());
    // init views
    ExpressViews.init(expressInstance);
    // init statics
    ExpressStatics.init(expressInstance);
    // init services
    ExpressServices.init(expressInstance);
    // init websockets
    const serverInstance = http.Server(expressInstance);
    socketInstance = io(serverInstance);
    ExpressWebSockets.init(socketInstance);
    // start server
    serverInstance.listen(Config.getConfig().getExpressPort(), function () { });
};

// exported methods
exports.start = start;
exports.getInstance = getInstance;
exports.getSocketInstance = getSocketInstance;