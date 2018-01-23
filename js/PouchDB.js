// external dependencies
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-adapter-memory"));
//PouchDB.debug.enable("pouchdb:find");

// exported methods
exports.getDatabase = function (dbName) {
    return new PouchDB(dbName, { adapter: "memory" });
};