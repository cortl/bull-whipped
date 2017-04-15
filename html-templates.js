var Handlebars = require('handlebars');
var chartsHTML = require('./templates/charts.js');
var componentsHTML = require("./templates/components.js");
var navigationHTML = require("./templates/navigation.js");

function buildChart(sensor, label, title, size, last, height, component, extraJS) {
    // TODO Use a json datastructure as an argument, rather than a list (which allows for optional values)
    if (typeof size == 'undefined') {
        size = 4;
    }
    var automaticUpdateTemplate = Handlebars.compile(chartsHTML.automaticUpdateHTML);
    var chartHtmlTemplate = Handlebars.compile(chartsHTML.chartHTML);
    var chartFrameTemplate = Handlebars.compile(chartsHTML.chartFrameHTML);
    var automaticUpdateData = {
        "sensor-name": sensor,
        "last": last,
        "extra": extraJS
    }
    var chartHTMLData = {
        "automatic-update-js": automaticUpdateTemplate(automaticUpdateData),
        "sensor-name": sensor,
        "line-label": label,
        "height": size
    };
    var chartFrameData = {
        "chart-title": title,
        "sensor-name": sensor,
        "height": height,
        "chart-javascript": chartHtmlTemplate(chartHTMLData),
        "chartsize": size,
        "component": component
    };
    return chartFrameTemplate(chartFrameData);
}

function buildDashboard(title, sensorInformation) {
    // CREATE PAGE REQUIREMENTS (navigation, breadcrumbs)
    var navigationTemplate = Handlebars.compile(navigationHTML.navHTML);
    var navHTML = navigationTemplate({
        modules: global.navbar,
        dashboard: true
    })
    var sensorCharts = ""
    for (var i = 0; i < sensorInformation.length; i++) {
        var sensor = sensorInformation[i].sensorname;
        var label = sensorInformation[i].measurement;
        var title = sensorInformation[i].title;
        sensorCharts = sensorCharts + buildChart(sensor, label, title, 4, 5, NaN, true);
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

function buildMeasurementPage(sensor, title, pageicon, label) {
    // CREATE PAGE REQUIREMENTS (navigation, breadcrumbs)
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
    var breadcrumbsTemplate = Handlebars.compile(navigationHTML.breadcrumbsHTML)

    var breadcrumbs = breadcrumbsTemplate({
        "page-title": title,
        "page-icon": pageicon,
        "sensor": sensor
    })

    // CREATE CONTENT FOR PAGE
    var body = ""

    var charthtml = buildChart(sensor, label, title, 12, NaN, 50, false);
    body = body + charthtml


    var html = {
        "nav": nav,
        "breadcrumbs": breadcrumbs,
        "body": body
    }

    return html
}
module.exports = {
    buildDashboard: buildDashboard,
    buildMeasurementPage: buildMeasurementPage
}
