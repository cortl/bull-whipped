var moment = require('moment');
var htmlpartials = require("./html-templates");

module.exports = function(db, app) {
    // Create a route for every sensor (giving them their own pages)
    app.get('/modules/*', function(req, res) {
        var url = req.url.split("/"); // we want the last item in this array, name of the module
        db.all("SELECT * FROM avail_sensors WHERE sensorname=\'" + url[2] + "\'", function(err, rows) {
            if (typeof rows == undefined) {
                res.status(404)
                res.send("Module Not Found")
            }
            db.all("SELECT * FROM sensor_types WHERE type='" + rows[0].type + "'", function(err, typeRows) {
                var title = rows[0].title;
                var type = rows[0].type;
                var pageicon = typeRows[0].icon;
                var sensor = rows[0].sensorname;
                var label = rows[0].measurement;

                var htmlData;
                if (type == 'Thermometer'){
                  htmlData = htmlpartials.buildMeasurementPage(sensor, title, pageicon, label, db)
                } else if (type == 'Water') {
                  htmlData = htmlpartials.buildMeasurementPage(sensor, title, pageicon, label, db)
                } else if (type == 'Remote') {
                  htmlData = htmlpartials.buildRemotePage(sensor, title, pageicon, db)
                } else if (type == 'Relay') {
                  htmlData = htmlpartials.buildRelayPage(sensor, title, pageicon, label, db)
                }
                res.render('pages/index', {
                    body: htmlData["body"],
                    title: title,
                    subtitle: "",
                    breadcrumbs: htmlData["breadcrumbs"],
                    navhtml: htmlData["nav"]
                });
            })
        });
    });
    app.get('/', function(req, res) {
        db.all("SELECT * FROM avail_sensors", function(err, rows) {
            var title = "Smart Home Dashboard";
            var htmlData = htmlpartials.buildDashboard(title, rows, db)
            res.render('pages/index', {
                body: htmlData["body"],
                title: "Smart Home Dashboard",
                subtitle: "",
                breadcrumbs: "",
                navhtml: htmlData["nav"]
            });
        });
    });

    // Get Posted Information and save to database
    // app.post('/record', function(req, res) {
    //     var sensor = req.body.sensor;
    //     var value = req.body.data;
    //     var title = req.body.title;
    //     var measurement = req.body.measurement;
    //     // font-awesome icons (for customization)
    //     var pageicon = req.body.icon;
    //     if (sensor == "" || value == "" || typeof sensor == 'undefined' || typeof value == 'undefined') {
    //         // Nothing was sent, send 400 bad request
    //         res.writeHead(400, {
    //             'Content-Type': 'text/html'
    //         });
    //         res.end("<!doctype html><html><head><title>Bad Request</title></head><body>Bad Request.</body></html>")
    //     } else {
    //         // Check if table exists for that sensor
    //         db.all("SELECT count(*) AS rowCount FROM avail_sensors WHERE sensorname='" + sensor + "';", function(err, row) {
    //             if (row[0].rowCount == 0) {
    //                 // sensor doesn't exist, create it.
    //                 console.log("Attempting to register a new sensor: " + sensor + "...");
    //                 // need measurement and title variables inputted to create a new table, if their aren't any then tell them off
    //                 if (measurement == "" || typeof measurement == 'undefined' || title == "" || typeof title == 'undefined') {
    //                     console.log("Sensor didn't provide enough information to properly register, ignoring request.")
    //                     res.writeHead(400, {
    //                         'Content-Type': 'text/html'
    //                     });
    //                     res.end("<!doctype html><html><head><title>Bad Request</title></head><body>Data doesn't exist in database, no measurment or title sent either.  Unable to create sensor data.</body></html>")
    //                 } else {
    //                     console.log("Sensor has been registered.")
    //                     if (typeof pageicon != 'undefined' || pageicon != "") {
    //                         var state = 'INSERT INTO avail_sensors(sensorname, title, measurement, pageicon) VALUES ("' + sensor + '", "' + title + '", "' + measurement + '", "' + pageicon + '");';
    //                     } else {
    //                         var state = 'INSERT INTO avail_sensors(sensorname, title, measurement) VALUES ("' + sensor + '", "' + title + '", "' + measurement + '");';
    //                     }
    //                     // console.log(state)
    //                     db.run(state);
    //                     res.writeHead(200, {
    //                         'Content-Type': 'text/html'
    //                     });
    //                     res.end("<!doctype html><html><head><title>Received</title></head><body>Data Received.</body></html>")
    //                     updateRoutes()
    //                 }
    //             } else {
    //                 // sensor has been registered, add the measurement in.
    //                 db.all("SELECT * FROM avail_sensors WHERE sensorname = \"" + sensor + "\"", function(err, row) {
    //                     sensorID = row[0].id;
    //                     var query = 'INSERT INTO measurements(sensorID, date, value) VALUES (' + sensorID + ', CURRENT_TIMESTAMP, ' + value + ');'
    //                     var stmt = db.prepare(query);
    //                     stmt.run()
    //                     stmt.finalize()
    //                     res.writeHead(200, {
    //                         'Content-Type': 'text/html'
    //                     });
    //                     res.end("<!doctype html><html><head><title>Received</title></head><body>Data Received.</body></html>")
    //                     console.log("Recorded Data from Sensor: " + sensor + ", Measurement: " + value)
    //                 })
    //             }
    //         });
    //     }
    // });
    app.get('/getData', function(req, res) {
        var sensor = req.query.sensor
        var last = req.query.last
        if (sensor != "" && typeof sensor != 'undefined') {
            // Person asking for the last x number of database entries
            db.all("SELECT * FROM avail_sensors WHERE sensorname = \"" + sensor + "\"", function(err, row) {
                // sensor doesn't exist in the table, throw an error and get out of here boi
                if (typeof row[0] == 'undefined') {
                    res.end()
                    return
                }
                sensorID = row[0].id;
                var query = ""
                if (last != "" && typeof last != 'undefined') {
                    query = 'SELECT strftime(\'%Y-%m-%d %H:%M:%S\',datetime(date, \'localtime\')) AS date, value FROM measurements WHERE sensorID = ' + sensorID + ' ORDER BY datetime(date) DESC Limit ' + last + ';'
                } else {
                    query = 'SELECT strftime(\'%Y-%m-%d %H:%M:%S\',datetime(date, \'localtime\')) AS date, value FROM measurements WHERE sensorID = ' + sensorID + ' ORDER BY datetime(date)'
                }
                db.all(query, function(err, row) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    for (var i = 0; i < row.length; i++) {
                        var iterDate = moment(row[i].date);
                        row[i].date = iterDate.format('h:mm A')
                    }
                    res.write(JSON.stringify(row.reverse()));
                    res.end()
                });
            })
        } else {
            res.writeHead(404, {
                'Content-Type': 'text/html'
            });
            res.end("<!doctype html><html><head><title>Bad Sensor</title></head><body>No such sensor exists.</body></html>")
        }
    });

    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });
}
