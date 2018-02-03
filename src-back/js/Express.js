// external dependencies
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");

// application dependencies
const Passport = require(__dirname + "/Passport");
const ExpressStatics = require(__dirname + "/ExpressStatics");
const ExpressServices = require(__dirname + "/ExpressServices");
const ExpressViews = require(__dirname + "/ExpressViews");
const Config = require(__dirname + "/Config");

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
        // init views
        ExpressViews.init(instance);
        // init statics
        ExpressStatics.init(instance);
        // init services
        ExpressServices.init(instance);
        // start server
        instance.listen((process.env.PORT || Config.getConfig().expressPort), () => {

        });
    }
};