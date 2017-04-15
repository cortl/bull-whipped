// NAVIGATION LINKS TEMPLATE
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
                  <li><a href="/modules/{{this.sensor}}"><i class="{{this.icon}}" aria-hidden="true"></i> {{this.title}}</a></li>\
                {{/if}}\
              {{/each}}\
        </ul>\
    </div>\
    <!-- /.navbar-collapse -->\
</nav>\
'

// PAGE BREADCRUMBS TEMPLATE
var breadcrumbsHTML = '\
<li><i class=\"{{page-icon}}\"></i><a href=\"/modules/{{sensor}}\"> {{page-title}}</a></li>\
'
module.exports = {
  navHTML: navHTML,
  breadcrumbsHTML : breadcrumbsHTML
}
