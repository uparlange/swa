// external dependencies
const PouchDB = require("pouchdb-node");
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-adapter-node-websql"));
PouchDB.plugin(require("pouchdb-adapter-memory"));
//PouchDB.debug.enable("pouchdb:find");

// application dependencies
const Config = require(__dirname + "/Config");

// body
const getDatabase = function (dbName) {
    const path = __dirname + "/../data/db/" + dbName + ".db";
    return new PouchDB(path, { adapter: Config.getConfig().getPouchDbAdapter() });
};

// exported methods
exports.getDatabase = getDatabase;