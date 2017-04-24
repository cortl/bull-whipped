var rowHTML = '\
<div class="row">{{{html}}}</div>\
'
// Extra boxes used for displaying messages, etc
var componentOverviewHTML = '\
<div class="col-lg-3 col-md-6">\
    <div class="panel panel-primary">\
        <div class="panel-heading">\
            <div class="row">\
                <div class="col-xs-3">\
                    <i class="fa fa-comments fa-5x"></i>\
                </div>\
                <div class="col-xs-9 text-right">\
                    <div class="huge">26</div>\
                    <div>New Comments!</div>\
                </div>\
            </div>\
        </div>\
        <a href="#">\
            <div class="panel-footer">\
                <span class="pull-left">View Details</span>\
                <span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span>\
                <div class="clearfix"></div>\
            </div>\
        </a>\
    </div>\
</div>'

var odometerHoldHTML = '\
  <div class="col-lg-{{size}} col-md-6">\
    <h3>{{title}}</h3>\
    <h1 id={{variable}} class="odometer"></h1>\
  </div>\
'

var odometerHoldJS = '\
setTimeout(function(){\
  jQuery("#{{id}}").text({{{value}}});\
  console.log("{{{value}}}")\
}, 1000);\
'
module.exports = {
  componentOverviewHTML: componentOverviewHTML,
  rowHTML: rowHTML,
  odometerHoldHTML : odometerHoldHTML,
  odometerHoldJS : odometerHoldJS
}
