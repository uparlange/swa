// external dependencies
const fs = require("fs");

// application dependencies
const Passport = require(__dirname + "/Passport");

// body
const init = function (instance) {
    fs.readdirSync(__dirname).forEach((item, index, array) => {
        if (item.indexOf("SERVICES") !== -1) {
            const path = __dirname + "/" + item;
            require(path).init(instance, Passport.AUTHENTICATED_SERVICE);
        }
    });
};

// exported methods
exports.init = init;