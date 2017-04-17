module.exports = function(db, app) {
    db.serialize(function() {
        // create enum type table (no enums in sqlite)
        db.run("CREATE TABLE sensor_types (type TEXT PRIMARY KEY, icon TEXT)");
        db.run("INSERT INTO sensor_types (type, icon) VALUES ('Thermometer', 'fa fa-thermometer-empty')");
        db.run("INSERT INTO sensor_types (type, icon) VALUES ('Water', 'fa fa-tint')");
        db.run("INSERT INTO sensor_types (type, icon) VALUES ('Remote', 'fa fa-television')");

        db.run("CREATE TABLE avail_sensors (id INTEGER PRIMARY KEY AUTOINCREMENT, sensorname TEXT, title TEXT, measurement TEXT, type TEXT REFERENCES sensor_types(type))")
        db.run("CREATE TABLE measurements (sensorID INTEGER, measurementsID INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, value FLOAT, FOREIGN KEY (sensorID) REFERENCES avail_sensors(id))")
        // Fill database with test information
        sensorCreate(db, "temp1", "Internal Temperature", "Fahrenheit (F)", 1, "Thermometer");
        sensorCreate(db, "sump", "Sump Pump", "Distance (cm)", 2, "Water");
        sensorCreate(db, "temp2", "Outside Temperature", "Fahrenheit (F)", 3, "Thermometer");
        sensorCreate(db, "remote", "TV Remote", "", 4, "Remote");
    });
}

function sensorCreate(db, sensorname, title, measurement, id, type){
  var query = 'INSERT INTO avail_sensors(sensorname, title, measurement, type) VALUES ("'+sensorname+'", "'+title+'", "'+measurement+'", "'+type+'");'
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
