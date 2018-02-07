// external dependencies
const passport = require("passport");
const passportJwt = require("passport-jwt");

// application dependencies
const UserDAO = require(__dirname + "/UserDAO");
const Config = require(__dirname + "/Config");

// body
const jwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Config.getConfig().getPassportSecretOrKey()
};
const strategy = new passportJwt.Strategy(jwtOptions, function (payload, next) {
    UserDAO.getById(payload.id).then(function (user) {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
});
passport.use(strategy);

const getInstance = function () {
    return passport;
};

// exported variables
exports.AUTHENTICATED_SERVICE = passport.authenticate("jwt", { session: false });

// exported methods
exports.getInstance = getInstance;