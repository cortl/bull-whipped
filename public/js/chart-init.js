$(document).ready(function() {
    var date = [];
    var temp = [];
    var initialized = false;

    setInterval(function() {
        $.ajax({
            url: "/getData?sensor=temp&last=5",
            method: "GET",
            success: function(data) {
                    console.log(data)
                    for (var i in data) {
                      // if the received dates aren't already in the chart, go ahead and put it in there
                        if ($.inArray(data[i].date,date) == -1){
                          date.push(data[i].date);
                          temp.push(data[i].value);
                      }
                    }
                    lineGraph.update()
            },
            error: function(data) {
                console.log(data)
            }
        });
    }, 1000);

    var tempChartData = {
        labels: date,
        datasets: [{
            label: "Temperature (F)",
            data: temp,
        }]
    };

    var ctx = document.getElementById('temperature-chart').getContext('2d');
    var lineGraph = new Chart(ctx, {
        type: 'line',
        data: tempChartData
    });
})
