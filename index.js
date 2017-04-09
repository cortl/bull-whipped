var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var Handlebars = require('handlebars');
var Chart = require('chartjs')

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(':memory:')

db.serialize(function() {
  db.run("CREATE TABLE temp (date TEXT, value FLOAT)");


// Fake measurements in the database for testing
  var measurements = [12,38,24,57,67,70,71,72,74,50,32,18,20]
  var dates = ["2017-03-13 13:33:17","2017-03-13 13:34:17","2017-03-13 13:35:17","2017-03-13 13:36:17",
                "2017-03-13 13:37:17","2017-03-13 13:38:17","2017-03-13 13:39:17","2017-03-13 13:40:17",
              "2017-03-13 13:41:17","2017-03-13 13:42:17","2017-03-13 13:44:17","2017-03-13 13:45:17",
            "2017-03-13 13:46:17"]
  for (var i = 0; i < measurements.length; i++) {
    var query = 'INSERT INTO temp (date, value) VALUES (\''+dates[i]+'\', '+measurements[i]+');'
    var stmt = db.prepare(query);
    stmt.run()
  }
  stmt.finalize;
  db.each("SELECT * FROM temp", function(err, row) {
      console.log(row.date + ": " + row.value);
  });
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  var chartFrameHTML = '<div class="col-lg-4"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title"><i class="fa fa-long-arrow-right fa-fw"></i>{{chart-title}}</h3></div><div class="panel-body"><canvas id="{{chart-title}}"></canvas>{{{chart-javascript}}}<div class="text-right"><a href="#">View Details <i class="fa fa-arrow-circle-right"></i></a></div></div></div></div>';
  var chartHtml = '<script>\
        var data = {\
            labels: {{{chartLabels}}},\
            datasets: [\
                {\
                    label: "Temperature (F)",\
                    fillColor: "rgba(220,220,220,0.2)",\
                    strokeColor: "rgba(220,220,220,1)",\
                    pointColor: "rgba(220,220,220,1)",\
                    pointStrokeColor: "#fff",\
                    pointHighlightFill: "#fff",\
                    pointHighlightStroke: "rgba(220,220,220,1)",\
                    data: {{{chartEntries}}}\
                }\
            ]\
        };\
\
        var ctx = document.getElementById("{{chart-title}}").getContext("2d");\
        var lineGraph = new Chart(ctx, {\
          type: \'line\',\
          data})\
    </script>'
  var chartlabel = '["a","b"]'
  var chartdata = '["50","100"]'
  var chartHTMLData = {
    "chartLabels":chartlabel,
    "chartEntries":chartdata,
    "chart-title":"birdjesus"
  };
  var chartHtmlTemplate = Handlebars.compile(chartHtml)
  var chartFrameTemplate = Handlebars.compile(chartFrameHTML);

  var chartFrameData = {
    "chart-title": "birdjesus",
    "chart-javascript":chartHtmlTemplate(chartHTMLData)
  };
  var result = chartFrameTemplate(chartFrameData);
  console.log(result)
  var chart = {charthtml : result};
  res.render('pages/index', { locals: { data : chart } });
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
  if (sensor == "" || measurement == "" || typeof sensor == 'undefined' || typeof measurement == 'undefined'){
    // Nothing was sent, send 400 bad request
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.end("<!doctype html><html><head><title>Bad Request</title></head><body>Bad Request.</body></html>")
  } else {
    console.log("Recorded Data from Sensor: "+sensor+", Measurement: "+measurement)

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
  var last = req.query.last
  if (sensor != "" && typeof sensor != 'undefined'){
    if (last != "" && typeof last != 'undefined'){
      // Person asking for the last x number of database entries
      db.all('SELECT strftime(\'%Y-%m-%d %H:%M:%S\',datetime(date, \'localtime\')) AS date, value FROM '+sensor+' ORDER BY datetime(date) DESC Limit '+last+';', function (err, row) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        for (var i = 0; i < row.length; i++) {
          var iterDate = moment(row[i].date);
          row[i].date = iterDate.format('h:mm A')
        }
        res.write(JSON.stringify(row.reverse()));
        res.end()
      });
    } else {
      db.all('SELECT strftime(\'%Y-%m-%d %H:%M:%S\',datetime(date, \'localtime\')) AS date, value FROM temp', function (err, row) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        for (var i = 0; i < row.length; i++) {
          // Pretty print dat date boi
          var iterDate = moment(row[i].date);
          row[i].date = iterDate.format('h:mm A')
        }
        res.write(JSON.stringify(row.reverse()));
        res.end()
      });
    }
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end("<!doctype html><html><head><title>Bad Sensor</title></head><body>No such sensor exists.</body></html>")
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
