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
}, 1000);\
\
{{#if extra}}\
jQuery(document).ready(function() {\
  {{{extra}}} \
}); \
{{/if}}\
'

var chartHTML = '<script>\
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
            <a href="/modules/{{sensor-name}}">View Details <i class="fa fa-arrow-circle-right"></i></a>\
          </div>\
          {{/if}}\
        </div>\
      </div>\
  </div>'

module.exports = {
    automaticUpdateHTML: automaticUpdateHTML,
    chartHTML: chartHTML,
    chartFrameHTML: chartFrameHTML
}
