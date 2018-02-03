// application dependencies
const PouchDB = require(__dirname + "/PouchDB");

// body
const mockData = [
    { userId: "jdoe", date: new Date().toISOString(), type: "BIRTHDAY", title: "Wife's birthday !", description: "" },
    { userId: "jdoe", date: new Date().toISOString(), type: "NOTE", title: "Go down the trash cans", description: "" }
];
const db = PouchDB.getDatabase("db/events");
db.info().then((result) => {
    if (result.doc_count === 0) {
        db.createIndex({
            index: {
                fields: ["date"]
            }
        }).then(function (result) {
            db.bulkDocs(mockData);
        });
    }
});

const getDateFromISOString = function (dateISOString) {
    return dateISOString.split("T")[0];
};

const getDateFromDatetime = function (date) {
    return getDateFromISOString(date.toISOString());
};

// exported methods
exports.findByUserAndDate = function (userId, dateISOString) {
    return new Promise(function (resolve, reject) {
        const today = getDateFromISOString(dateISOString);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        db.find({
            selector: {
                userId: (userId || ""),
                date: { $gte: today, $lt: getDateFromDatetime(tomorrow) }
            },
            sort: [{ date: "desc" }]
        }).then(function (result) {
            resolve(result.docs);
        }).catch(function (err) {
            reject({ message: "TECHNICAL_ERROR" });
        });
    });
};