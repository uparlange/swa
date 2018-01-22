// external dependencies
const express = require("express");
const bodyParser = require("body-parser");

// application dependencies
const Passport = require("./Passport");
const ExpressStatics = require("./ExpressStatics");
const ExpressServices = require("./ExpressServices");

// body
const serverPort = 3000;
let instance = null;

// exported methods
exports.start = function () {
    if (instance === null) {
        // init express
        instance = express();
        instance.use(Passport.getInstance().initialize());
        instance.use(bodyParser.urlencoded({
            extended: true
        }));
        instance.use(bodyParser.json());
        // init statics
        ExpressStatics.init(instance);
        // init services
        ExpressServices.init(instance);
        // start server
        instance.listen(serverPort, () => {
            //console.log("Express is running on port " + serverPort);
        });
    }
};