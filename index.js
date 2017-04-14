// required modules
var express = require('express');
var app = express();
var morgan = require('morgan');
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
var dbinit = require("./db.js")(db);

//
// Map routes
//
var routes = require("./routes.js")(db, app);
