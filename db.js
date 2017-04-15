module.exports = function(db, app) {
    db.serialize(function() {
        db.run("CREATE TABLE avail_sensors (id INTEGER PRIMARY KEY AUTOINCREMENT, sensorname TEXT, title TEXT, measurement TEXT, pageicon TEXT)")
        db.run("CREATE TABLE measurements (sensorID INTEGER, measurementsID INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, value FLOAT, FOREIGN KEY (sensorID) REFERENCES avail_sensors(id))")

        // Fill database with test information
        sensorCreate(db, "temp1", "Internal Temperature", "Fahrenheit (F)", 1, "fa fa-home");
        sensorCreate(db, "sump", "Sump Pump", "Distance (cm)", 2, "fa fa-tint");
        sensorCreate(db, "temp2", "Outside Temperature", "Fahrenheit (F)", 3, "fa fa-thermometer-empty");
    });
}

function sensorCreate(db, sensorname, title, measurement, id, icon){
  var query = 'INSERT INTO avail_sensors(sensorname, title, measurement, pageicon) VALUES ("'+sensorname+'", "'+title+'", "'+measurement+'", "'+icon+'");'
  var stmt = db.prepare(query)
  stmt.run()
  stmt.finalize;
  // Fake measurements in the database for testing
  var dates = ["2017-03-13 13:33:17", "2017-03-13 13:34:17", "2017-03-13 13:35:17", "2017-03-13 13:36:17",
      "2017-03-13 13:37:17", "2017-03-13 13:38:17", "2017-03-13 13:39:17", "2017-03-13 13:40:17",
      "2017-03-13 13:41:17", "2017-03-13 13:42:17", "2017-03-13 13:44:17", "2017-03-13 13:45:17",
      "2017-03-13 13:46:17"
  ]
  for (var i = 0; i < dates.length; i++) {
      measure = Math.floor(Math.random() * (100 - 0)) + 0;
      var query = 'INSERT INTO measurements(sensorID, date, value) VALUES ('+id+', \'' + dates[i] + '\', ' + measure + ');'
      var stmt = db.prepare(query);
      stmt.run()
  }
  stmt.finalize;
}
