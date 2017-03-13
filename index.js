var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(':memory:')

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/basement',function(req, res) {
  res.render('pages/basement');
});

app.get('/livingroom',function(req, res) {
  res.render('pages/basement');
});

app.get('/record', function(req, res){
  res.render('pages/record');
});

// Get Posted Information and save to database
app.post('/record', function(req, res) {
  var sensor = req.body.sensor;
  var measurement = req.body.data;

  console.log(sensor);
  console.log(measurement);
  if (sensor == "" || measurement == "" || typeof sensor == 'undefined' || typeof measurement == 'undefined'){
    // Nothing was sent, send 400 bad request
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.end("<!doctype html><html><head><title>Bad Request</title></head><body>Bad Request.</body></html>")
  } else {
    console.log("Recorded Data from Sensor: "+sensor)

    // Check if table exists for that sensor
    db.all("SELECT count(*) AS tableCount FROM sqlite_master WHERE type='table' AND name='"+sensor+"';", function (err, row) {
      if (row[0].tableCount == 0){
        // table doesn't exist, create it.
        console.log("New sensor, table "+sensor+" created");
        db.run('CREATE TABLE '+sensor+' (date TEXT, value FLOAT)');
      } else {
        var query = 'INSERT INTO '+sensor+' (date, value) VALUES (CURRENT_TIMESTAMP, '+measurement+');'
        var stmt = db.prepare(query);
        stmt.run()
        stmt.finalize()
      }
    });
    // Response
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("<!doctype html><html><head><title>Received</title></head><body>Data Received.</body></html>")
  }
});

app.get('/getData', function(req, res){
  var sensor = req.query.sensor
  if (sensor != ""){
    db.all('SELECT * FROM temp', function (err, row) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(row));
      res.end()
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end("<!doctype html><html><head><title>Bad Sensor</title></head><body>No such sensor exists.</body></html>")
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
