module.exports = function(db) {
    db.serialize(function() {
        db.run("CREATE TABLE avail_sensors (id INTEGER PRIMARY KEY AUTOINCREMENT, sensorname TEXT, title TEXT, measurement TEXT, pageicon TEXT)")
        db.run("CREATE TABLE measurements (sensorID INTEGER, measurementsID INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, value FLOAT, FOREIGN KEY (sensorID) REFERENCES avail_sensors(id))")

        var query = 'INSERT INTO avail_sensors(sensorname, title, measurement, pageicon) VALUES ("temp1", "Internal Temperautre", "Fahrenheit (F)", "fa fa-home");'
        var stmt = db.prepare(query)
        stmt.run()
        stmt.finalize;
        // Fake measurements in the database for testing
        var measurements = [12, 38, 24, 57, 67, 70, 71, 72, 74, 50, 32, 18, 20]
        var dates = ["2017-03-13 13:33:17", "2017-03-13 13:34:17", "2017-03-13 13:35:17", "2017-03-13 13:36:17",
            "2017-03-13 13:37:17", "2017-03-13 13:38:17", "2017-03-13 13:39:17", "2017-03-13 13:40:17",
            "2017-03-13 13:41:17", "2017-03-13 13:42:17", "2017-03-13 13:44:17", "2017-03-13 13:45:17",
            "2017-03-13 13:46:17"
        ]
        for (var i = 0; i < measurements.length; i++) {
            var query = 'INSERT INTO measurements(sensorID, date, value) VALUES (1, \'' + dates[i] + '\', ' + measurements[i] + ');'
            var stmt = db.prepare(query);
            stmt.run()
        }
        stmt.finalize;
        db.each("SELECT * FROM measurements WHERE sensorID = 1", function(err, row) {
            // console.log(row.date + ": " + row.value);
        });

    });
}
