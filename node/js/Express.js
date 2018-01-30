// external dependencies
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");

// application dependencies
const Passport = require("./Passport");
const ExpressStatics = require("./ExpressStatics");
const ExpressServices = require("./ExpressServices");

// body
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
        instance.use(compression());
        // init statics
        ExpressStatics.init(instance);
        // init services
        ExpressServices.init(instance);
        // start server
        instance.listen((process.env.PORT || 8080), () => {
            
        });
    }
};