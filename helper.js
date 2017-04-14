var htmlpartials = require("./html-templates");

module.exports = {
  updateNav : updateNav,
  updateRoutes : updateRoutes
}
function updateNav(db){
  db.all("SELECT * FROM avail_sensors", function(err, rows){
    var modulesArray = [];
    for (var i = 0; i < rows.length; i++) {
      var sensor = rows[i].sensorname;
      var icon = rows[i].pageicon;
      var title = rows[i].title;
      var ientry = {
        "icon" : icon,
        "sensor" : sensor,
        "title" : title,
        "active" : false
      }
      modulesArray.push(ientry);
    }
    // set datastructure as global
    global.navbar = modulesArray;
  });
}
function updateRoutes(db, app) {
  updateNav(db);
  db.all("SELECT * FROM avail_sensors", function(err, rows){
    for (var i = 0; i < rows.length; i++) {
      var title = rows[i].title;
      var pageicon = rows[i].pageicon;
      var sensor = rows[i].sensorname;
      var label = rows[i].measurement;
      var route = "/"+sensor
      // map the route
      app.get(route, function (req, res){
        // db.all("SELECT * FROM avail_sensors WHERE ")
        // need to use a navbar with the current link on "active"
        // find our sensor and make it's nav link to be active
        for (var x = 0; x < global.navbar.length; x++){
          if (global.navbar[x].sensor == sensor){
            global.navbar[x].active = true;
          };
        }
        // generate the sensor page

        var body = htmlpartials.componentBodyTemplate({
          charthtml : htmlpartials.buildChart(sensor, label, title, 12,NaN,50,false)
        });
        var nav = htmlpartials.navigationTemplate({modules: global.navbar, dashboard : false})

        // unset all actives
        for (var x = 0; x < global.navbar.length; x++){ global.navbar[x].active = false;};
        res.render('pages/index',
          {
            body: body,
            title: title,
            subtitle: "",
            breadcrumbs: htmlpartials.breadcrumbsTemplate({"page-title":title, "page-icon": pageicon}),
            navhtml: nav
          });
      });
    }
  });
}
