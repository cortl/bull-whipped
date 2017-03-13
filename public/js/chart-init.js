$(document).ready(function() {
    $.ajax({
      url: "/getData?sensor=temp",
      method: "GET",
      success: function(data) {
        var date = [];
        var temp = [];

        for (var i in data) {
          date.push("Date " + data[i].date);
          temp.push(data[i].value);
        }
        var tempChartData = {
          labels: date,
          datasets: [
            {
              label: "Temperature (F)",
              data : temp,
            }
          ]};
        var ctx = document.getElementById('temperature-chart').getContext('2d');
        var lineGraph = new Chart(ctx, {
          type: 'line',
          data: tempChartData
        });
      },
      error: function(data) {
        console.log(data)
      }
    });

    function updateTemp() {
      $
    }

    window.setInterval(function(){

    }, 5000);
})
