var Handlebars = require('handlebars');

// CHART HTML PARTIALS
var automaticUpdateHTML = '\
var {{sensor-name}}date = [];\
var {{sensor-name}}value = [];\
setInterval(function() {\
  $.ajax({\
    {{#if last}}\
    url: "/getData?sensor={{sensor-name}}&last=5",\
    {{else}}\
    url: "/getData?sensor={{sensor-name}}",\
    {{/if}}\
    method: "GET",\
    success: function(data) {\
      for (var i in data) {\
        if ($.inArray(data[i].date,{{sensor-name}}date) == -1){\
          {{sensor-name}}date.push(data[i].date);\
          {{sensor-name}}value.push(data[i].value);\
        }\
      }\
      {{sensor-name}}Graph.update()\
    },\
    error: function(data) {\
      console.log(data)\
    }\
  });\
}, 1000);'

var chartHtml = '<script>\
  {{{automatic-update-js}}}\
  var {{sensor-name}}data = {\
    labels: {{sensor-name}}date,\
    datasets: [\
      {\
        label: "{{line-label}}",\
        data: {{sensor-name}}value\
      }\
    ]\
  };\
\
var ctx = document.getElementById("{{sensor-name}}").getContext("2d");\
var {{sensor-name}}Graph = new Chart(ctx, {\
  type: \'line\',\
  {{#if chartsize}}\
  maintainAspectRatio: true,\
  {{/if}}\
  data: {{sensor-name}}data})\
  </script>'

var chartFrameHTML = '\
  {{#if chartsize}}\
  <div class="col-lg-{{chartsize}}">\
  {{else}}\
  <div class="col-lg-4">\
  {{/if}}\
    <div class="panel panel-default">\
      <div class="panel-heading">\
        <h3 class="panel-title"><i class="fa fa-line-chart fa-fw"></i>{{chart-title}}</h3>\
      </div>\
      <div class="panel-body">\
        <canvas id="{{sensor-name}}" height="{{height}}px"></canvas>\
          {{{chart-javascript}}}\
          {{#if component}}\
          <div class="text-right">\
            <a href="/{{sensor-name}}">View Details <i class="fa fa-arrow-circle-right"></i></a>\
          </div>\
          {{/if}}\
        </div>\
      </div>\
  </div>'


// NOTIFICATION HTML PARTIALS, extra dashboard bits.
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

function buildChart(sensor, label, title, size, last, height, component){
  if(typeof size == 'undefined'){
    size = 4;
  }
  var automaticUpdateTemplate = Handlebars.compile(automaticUpdateHTML);
  var chartHtmlTemplate = Handlebars.compile(chartHtml);
  var chartFrameTemplate = Handlebars.compile(chartFrameHTML);
  var automaticUpdateData = {
    "sensor-name": sensor,
    "last": last
  }
  var chartHTMLData = {
    "automatic-update-js":automaticUpdateTemplate(automaticUpdateData),
    "sensor-name":sensor,
    "line-label":label,
    "height": size
  };
  var chartFrameData = {
    "chart-title": title,
    "sensor-name": sensor,
    "height" : height,
    "chart-javascript":chartHtmlTemplate(chartHTMLData),
    "chartsize": size,
    "component" :component
  };
  return chartFrameTemplate(chartFrameData);
}

var breadcrumbsHTML = '\
<li><i class=\"{{page-icon}}\"></i><a href=\"/remote\"> {{page-title}}</a></li>\
'

var navHTML = '\
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">\
    <!-- Brand and toggle get grouped for better mobile display -->\
    <div class="navbar-header">\
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">\
            <span class="sr-only">Toggle navigation</span>\
            <span class="icon-bar"></span>\
            <span class="icon-bar"></span>\
            <span class="icon-bar"></span>\
        </button>\
        <a class="navbar-brand" href="/">Bull Whipped Smart Home</a>\
    </div>\
    <!-- Top Menu Items -->\
    <ul class="nav navbar-right top-nav">\
    </ul>\
    <!-- Sidebar Menu Items - These collapse to the responsive navigation menu on small screens -->\
    <div class="collapse navbar-collapse navbar-ex1-collapse">\
        <ul class="nav navbar-nav side-nav">\
              {{#if dashboard}}\
              <li class="active"><a href="/"><i class="fa fa-dashboard"></i> Dashboard</a></li>\
              {{else}}\
              <li><a href="/"><i class="fa fa-dashboard"></i> Dashboard</a></li>\
              {{/if}}\
              {{#each modules}}\
                {{#if this.active}}\
                  <li class="active"><a href="/{{this.sensor}}"><i class="{{this.icon}}" aria-hidden="true"></i> {{this.title}}</a></li>\
                {{else}}\
                  <li><a href="/{{this.sensor}}"><i class="{{this.icon}}" aria-hidden="true"></i> {{this.title}}</a></li>\
                {{/if}}\
              {{/each}}\
        </ul>\
    </div>\
    <!-- /.navbar-collapse -->\
</nav>\
'

var componentBodyHTML = '\
  <div class="row">\
  {{{charthtml}}}\
  </div>\
'
module.exports = {
  automaticUpdateTemplate : Handlebars.compile(automaticUpdateHTML),
  chartHtmlTemplate: Handlebars.compile(chartHtml),
  chartFrameTemplate : Handlebars.compile(chartFrameHTML),
  breadcrumbsTemplate : Handlebars.compile(breadcrumbsHTML),
  navigationTemplate : Handlebars.compile(navHTML),
  componentBodyTemplate : Handlebars.compile(componentBodyHTML),
  buildChart: buildChart
}
