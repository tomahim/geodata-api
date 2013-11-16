'use strict';

/* Services */

app.service('D3', function(Restangular) {

	this.contructGraph = function(functionName) {
		eval(functionName).apply();	
	}

    var cityRepartition = function() {    
	    var width = 420,
	    barHeight = 25;

		var x = d3.scale.linear()
		    .range([0, width]);

		var chart = d3.select(".chart")
    	.attr("width", width);

        Restangular.all("stats/cityRepartition/15")
        .getList().then(function(data) {

        	var color = d3.scale.threshold()
		    .domain([10, 20, 20, 40, 50])
		    .range(["#D1D1F5", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

			x.domain([0, d3.max(data, function(d) { return d.total; })]);

			chart.attr("height", barHeight * data.length);

			var bar = chart.selectAll("g")
			    .data(data)
			    .enter().append("g")
			    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

			bar.append("rect")
			    .attr("width", function(d) { return x(d.total); })
			    .attr("height", barHeight - 1)
			    .style("fill", function(d) { return color(d.total); });

			bar.append("text")
			    .attr("x", function(d) { return x(d.total) - 3; })
			    .attr("y", barHeight / 2)
			    .attr("dy", ".35em")
			    .text(function(d) { return d.total; });

			bar.append("text")
			    .attr("x", 30)
			    .attr("y", barHeight / 2)
			    .attr("dy", ".35em")
			    .text(function(d) { return d.country._id; });

			bar.append("svg:title").text(function(d) { return d.country.name; });

		});
        return "Hello, World!"
    };

    function type(d) {
	  d.total = +d.total; // coerce to number
	  return d;
	}
});
