var Handlebars = require('handlebars');
var chartsHTML = require('./templates/charts.js');
var componentsHTML = require("./templates/components.js");
var navigationHTML = require("./templates/navigation.js");

function updateNavigationData(db) {
    if (typeof global.navbar == 'undefined'){
      global.navbar = []
    }
    db.all("SELECT * FROM avail_sensors", function(err, rows) {
        db.all("SELECT * FROM sensor_types", function(err, types) {
            // build easy indexing datastructure from types
            var modulesArray = [];
            for (var i = 0; i < rows.length; i++) {
                var sensor = rows[i].sensorname;
                var icon = "";
                for (var x = 0; x < types.length; x++){
                  if (rows[i].type == types[x].type){
                    icon = types[x].icon;
                  }
                }
                var title = rows[i].title;
                var ientry = {
                    "icon": icon,
                    "sensor": sensor,
                    "title": title,
                    "active": false
                }
                modulesArray.push(ientry);
            }
            // set datastructure as global
            global.navbar = modulesArray;
        });
    })
}

function buildChart(data) {
    if (typeof size == 'undefined') {
        size = 4;
    }
    var automaticUpdateTemplate = Handlebars.compile(chartsHTML.automaticUpdateHTML);
    var chartHtmlTemplate = Handlebars.compile(chartsHTML.chartHTML);
    var chartFrameTemplate = Handlebars.compile(chartsHTML.chartFrameHTML);
    var automaticUpdateData = {
        "sensor-name": data["sensor"],
        "last": data["last"],
        "extra": data["extra"]
    }
    var chartHTMLData = {
        "automatic-update-js": automaticUpdateTemplate(automaticUpdateData),
        "sensor-name": data["sensor"],
        "line-label": data["label"],
        "height": data["size"]
    };
    var chartFrameData = {
        "chart-title": data["title"],
        "sensor-name": data["sensor"],
        "height": data["height"],
        "chart-javascript": chartHtmlTemplate(chartHTMLData),
        "chartsize": data["size"],
        "component": data["component"]
    };
    return chartFrameTemplate(chartFrameData);
}
function buildNav(sensor, db){
  updateNavigationData(db);
  // loop through data in nav and set current sensor to active
  for (var x = 0; x < global.navbar.length; x++) {
      if (global.navbar[x].sensor == sensor) {
          global.navbar[x].active = true;
      };
  }
  // create the navigation HTML
  var navigationTemplate = Handlebars.compile(navigationHTML.navHTML)
  var nav = navigationTemplate({
      modules: global.navbar, // use global variable of links to create
      dashboard: false // is this the dashboard?
  })
  // unset all active nav links (for the next call to create a page)
  for (var x = 0; x < global.navbar.length; x++) {
      global.navbar[x].active = false;
  };
  return nav;
}

function buildDashboard(title, sensorInformation, db) {
    updateNavigationData(db);
    // CREATE PAGE REQUIREMENTS (navigation, breadcrumbs)
    var navigationTemplate = Handlebars.compile(navigationHTML.navHTML);
    var navHTML = navigationTemplate({
        modules: global.navbar,
        dashboard: true
    })
    var sensorCharts = ""
    for (var i = 0; i < sensorInformation.length; i++) {
        if (sensorInformation[i].type == 'Thermometer' || sensorInformation[i].type == 'Water'){
          var sensor = sensorInformation[i].sensorname;
          var label = sensorInformation[i].measurement;
          var title = sensorInformation[i].title;
          var data = {
            "sensor":sensor,
            "label":label,
            "title":title,
            "size":4,
            "last":5,
            "height":NaN,
            "component":true
          }
          sensorCharts = sensorCharts + buildChart(data);
      }
    }
    var rowsTemplate = Handlebars.compile(componentsHTML.rowHTML);

    var body = rowsTemplate({"html": sensorCharts});

    var html = {
      "body": body,
      "nav": navHTML,
      "breadcrumbs" : ""
    }
    return html
}

function buildMeasurementPage(sensor, title, pageicon, label, db) {
    // CREATE PAGE REQUIREMENTS (navigation, breadcrumbs)

    var breadcrumbsTemplate = Handlebars.compile(navigationHTML.breadcrumbsHTML)

    var breadcrumbs = breadcrumbsTemplate({
        "page-title": title,
        "page-icon": pageicon,
        "sensor": sensor
    })
    var nav = buildNav(sensor, db)
    // CREATE CONTENT FOR PAGE
    var odometerHoldJSTemplate = Handlebars.compile(componentsHTML.odometerHoldJS)
    var minValueJS = odometerHoldJSTemplate({
      "id":"minValue",
      "value":"Math.min.apply(null,"+sensor+"value)"
    })
    var maxValueJS = odometerHoldJSTemplate({
      "id":"maxValue",
      "value":"Math.max.apply(null,"+sensor+"value)"
    })
    var extraJS = minValueJS + maxValueJS;
    var body = ""
    data = {
      "sensor":sensor,
      "label":label,
      "title":title,
      "size":12,
      "height":50,
      "component": false,
      "extra" : extraJS
    }
    var charthtml = buildChart(data);
    var rowsTemplate = Handlebars.compile(componentsHTML.rowHTML);
    var charthtml = rowsTemplate({"html" :charthtml});
    var odometerTemplate = Handlebars.compile(componentsHTML.odometerHoldHTML);
    var minOdometerHTML = odometerTemplate({
      "size":4,
      "variable": "minValue",
      "title" : "Minimum Value"
    })
    var maxOdometerHTML = odometerTemplate({
      "size":4,
      "variable": "maxValue",
      "title": "Maximum Value"
    })
    body = rowsTemplate({"html": charthtml}) + rowsTemplate({"html": minOdometerHTML + maxOdometerHTML});

    var html = {
        "nav": nav,
        "breadcrumbs": breadcrumbs,
        "body": body
    }

    return html
}

function buildRemotePage(sensor, title, pageicon, db){
  var nav = buildNav(sensor, db)
  var breadcrumbsTemplate = Handlebars.compile(navigationHTML.breadcrumbsHTML)

  var breadcrumbs = breadcrumbsTemplate({
      "page-title": title,
      "page-icon": pageicon,
      "sensor": sensor
  })

  var html = {
      "nav": nav,
      "breadcrumbs": breadcrumbs,
      "body": "It's a remote, b"
  }
  return html
}
function buildRelayPage(sensor, title, pageicon, label, db){
  var html = {
      "nav": "yeah",
      "breadcrumbs": "...",
      "body": "It's a relay, b"
  }
  return html
}
module.exports = {
    buildDashboard: buildDashboard,
    buildMeasurementPage: buildMeasurementPage,
    buildRemotePage : buildRemotePage,
    buildRelayPage : buildRelayPage
}
