// external dependencies
const passport = require("passport");
const passportJwt = require("passport-jwt");

// application dependencies
const UserDAO = require("./UserDAO");
const Config = require("./Config");

// body
const passportSecretOrKey = Config.getConfig().passportSecretOrKey;
const jwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: passportSecretOrKey
};
const strategy = new passportJwt.Strategy(jwtOptions, function (payload, next) {
    UserDAO.findById(payload.id).then((user) => {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
});
passport.use(strategy);

// exported variables
exports.SECRET_OR_KEY = passportSecretOrKey;
exports.AUTHENTICATED_SERVICE = passport.authenticate("jwt", { session: false });

// exported methods
exports.getInstance = function () {
    return passport;
};