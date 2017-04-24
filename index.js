// required modules
var express = require('express');
var app = express();
var morgan = require('morgan');
var SerialPort = require("serialport");
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');

// initialize module settings
app.use(bodyParser.urlencoded({ // used for parsing HTML post/get requests
  extended: false
}));
app.use(bodyParser.json());

var sqlite3 = require('sqlite3').verbose(); // creating sqlite database in memory
var db = new sqlite3.Database(':memory:');

// app.use(morgan('dev')); // log every request that gets read

app.set('port', port);
app.use(express.static(__dirname + '/public'));
// set default location for pages and partials for ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//
// Create initial database tables
//
var dbinit = require("./db.js")(db, app);

//
// Map routes
//
var routes = require("./routes.js")(db, app);

//
// Read information from Serial
//
var serialport = new SerialPort("COM5", {
	parser: SerialPort.parsers.readline('\n')
});
serialport.on('open', function(){
  console.log('Serial Port Opend');
  serialport.on('data', function(data){
	  line = data.split(",")
	  var sensor = line[0];
	  var value = line[4];
	  var title = line[1];
	  var type = line[2];
	  var measurement = line[3];
	  db.all("SELECT count(*) AS rowCount FROM avail_sensors WHERE sensorname='" + sensor + "';", function(err, row) {
		  if (row[0].rowCount == 0) {
			  // sensor doesn't exist, create it.
			  console.log("Attempting to register a new sensor: " + sensor + "...");
			  // need measurement and title variables inputted to create a new table, if their aren't any then tell them off
			  console.log("Sensor has been registered.")
			  var state = 'INSERT INTO avail_sensors(sensorname, title, measurement, type) VALUES ("' + sensor + '", "' + title + '", "' + measurement + '", "' + type + '");';
			  db.run(state);
		  } else {
			  // sensor has been registered, add the measurement in.
			  db.all("SELECT * FROM avail_sensors WHERE sensorname = \"" + sensor + "\"", function(err, row) {
				  sensorID = row[0].id;
				  var query = 'INSERT INTO measurements(sensorID, date, value) VALUES (' + sensorID + ', CURRENT_TIMESTAMP, ' + value + ');'
				  var stmt = db.prepare(query);
				  stmt.run()
				  stmt.finalize()
				  console.log("Recorded Data from Sensor: " + sensor + ", Measurement: " + value)
			  })
		  }
  	});
});
});
