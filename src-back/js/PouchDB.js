// external dependencies
const PouchDB = require("pouchdb-node");
PouchDB.plugin(require("pouchdb-find"));
//PouchDB.plugin(require("pouchdb-adapter-memory"));
PouchDB.plugin(require("pouchdb-adapter-node-websql"));
//PouchDB.debug.enable("pouchdb:find");

// exported methods
exports.getDatabase = function (dbName) {
    /*
    const path = __dirname + "/../data/db/" + dbName;
    return new PouchDB(dbName, { adapter: "memory" });
    */
    const path = __dirname + "/../data/db/" + dbName + ".db";
    return new PouchDB(path, { adapter: "websql" });
};