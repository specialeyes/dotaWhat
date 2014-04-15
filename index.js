/**
 * Created by Jennifer on 4/4/14.
 */
var interaction = {

  init: function() {

      
      
  	
  	/**
	$('.nav-sidebar li').click(function(e) {
		var $this = $(this);
    var $curActive = $this.siblings(".active");
    var curActiveInd = $curActive.index();
    var desiredInd = $this.index();

		$curActive.children().css("color", "#2A6496")
      .css("background-color", "")
      .hover(function() {
        $(this).css("background-color", "")},
      function() {
        $(this).css("background-color", "")});
    $curActive.removeClass("active");

		$this.addClass('active');
		$this.children().css("color", "#fff")
      .css("background-color", "#428bca")
      .hover(function() {
        $(this).css("background-color", "#23537D")},
      function(){
        $(this).css("background-color", "#428bca")});


    switch (curActiveInd + 1) {
      case 1:
        $("#viz1").hide();
        break;
      case 2:
        $("#viz2").hide();
        break;
      case 3:
        $("#viz3").hide();
        break;
    }
    switch (desiredInd + 1) {
      case 1:
        $("#viz1").removeClass("hide").show();
        break;
      case 2:
        $("#viz2").removeClass("hide").show();
        break;
      case 3:
        $("#viz3").removeClass("hide").show();
        break;
    }
  });

*/
  },
  vizTitles: {
    titles: ["Parallel Coordinates", "Second Viz", "Third Viz"],
    subtitles: ["So cool", "what", "idk"]

  },
    viz1: function() {
      // Document Elements
      var margin = {top: 30, right: 25, bottom: 30, left: 25},
        w = 1150 - margin.right - margin.left,
        h = 500 - margin.top - margin.right;

      // Defining where vertical axes are going to be
      var x = d3.scale.ordinal().rangePoints([0, w],.5),
        y = {};

      // Instantiating variables
      var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground,
        dimensions;

      // Appending SVG drawing element
      var svg = d3.select("#viz1graph").append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Useful global (w/i viz#1) variables
      var curMatch,
        allPlayers = [];

      // Domain function defined
      var domainFn = function(players, property) {
        return d3.extent(players, function(player) {
//          console.log(player[property]);
          return player[property];
        });
      };

      // Helper function to strip K from gold and HD values
      function stripK(value) {
        return value.substring(0, value.length - 1);
      }

      // Loading data
      d3.json("sample.json", function (allMatches) {
        curMatch = allMatches[1];
        allPlayers = allPlayers.concat(curMatch["radiant"])
          .concat(curMatch["dire"]);
        allPlayers.forEach(function(d) {
          d.gold = +stripK(d.gold);
          d.HD = +stripK(d.HD);
        });

        // Show match # and winner
        var $vizTitle = $("#viz1").find("h2").text("Match " + curMatch["match_id"]+ " ");
        $('<small>').text(function() {
          if (+curMatch["winner"] === 0) return "Radiant Victory";
          else return "Dire Victory";
        }).appendTo($vizTitle);

        // Set domains (based on the data) for all the vertical axes
        dimensions = d3.keys(allPlayers[0]).filter(function(property) {
          return ((["player_id", "hero_id", "items"].indexOf(property) == -1) &&
            (y[property] = d3.scale.linear().domain(domainFn.call(null, allPlayers, property)).range([h,0])));
        });
        x.domain(dimensions);

        // Add grey lines for context
        background = svg.append("g")
          .attr("class", "parallelBackground")
          .selectAll("path")
          .data(allPlayers)
          .enter().append("path")
          .attr("d", path);

        foreground = svg.append("g")
          .attr("class", "parallelForeground")
          .selectAll("path")
          .data(allPlayers)
          .enter().append("path")
          .attr("stroke", function(d, i) {
            if (i < 5) return "#61A013";
            else return "#D6231C";
          })
          .attr("d", path);

        // Group element for each dimension/vertical axis
        var g = svg.selectAll(".dimension")
          .data(dimensions)
          .enter().append("g")
          .attr("class", "dimension")
          .attr("transform", function(d) {return "translate(" + x(d) + ")"; });

        // Add axes and titles to the group elements
        g.append("g")
          .attr("class", "parallelAxis")
          .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", -9)
          .text(String);

        // Add and store brush for each axis.
        g.append("g")
          .attr("class", "parallelBrush")
          .each(function(d) {d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush));})
          .selectAll("rect")
          .attr("x", -8)
          .attr("width", 16);
      });

      // Returns path for given data point
      function path(d) {
        return line(dimensions.map(function(p) {
          return [x(p), y[p](d[p])];
        }));
      }

      // Handles brush event, toggling display of foreground lines
      function brush() {
        var actives = dimensions.filter(function(p) {return !y[p].brush.empty();}),
          extents = actives.map(function(p) { return y[p].brush.extent(); });

        foreground.style("display", function(d) {
          return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
          }) ? null : "none";
        });
      }

    },
    viz2: function() {
    /**
    * Vis 2 Code
    */
    
        // Document formating
        var margin = {top: 20, right: 0, bottom: 30, left: 0};
    // var width = $('#viz2').width() - margin.left - margin.right;
    // var height = $('#viz2').height() - margin.top - margin.bottom;
    var radius = Math.min(width, height)/2;
    
    var width= 400;
    var height = 300;
    
        // Pie slice colors
    var color = d3.scale.category20c();
    
        // Radius of the pies
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);
        
    // What the pies represent.
    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.winrate; }); /* what each slice represents */
    
    
        /* use nest() by hero to arrange each small multiple pie chart  */
    // Load data
    d3.json("sample.json", function(data) {
      
        // Each pie for every hero id
        var heroes = d3.nest()
        .key(function(d) {return d.hero_id /* Each hero or player identification. player_id */})
        .entries(data);
    
        // add them to svg element. Format display
      var svg = d3.select("#vis2graph").selectAll("svg")
       .data(heroes)
       .enter().append("svg")
       .style("display", "inline-block")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
      .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        // Create pie
        var g = svg.selectAll("g")
            .data(function (d) {return  /* pie(d. % item_win_rate)  */ ; })
            .enter().append("svg:g");
        
        // Fill each pie based on item id, add on hover label for each pie slice.
        g.append("svg:path")
            .attr("d", arc )
            .style("fill", function(d) { return color(d.data.item_ID) ;})
            .append("svg:title")
            .text(function(d){return d.data.item_id + ": " + d.data.item_win_rate});
        
        
    
    
    
    
    
    
    });









        
    },
    viz3: function() {
    /**
  	 * Vis 3 Code 
  	 */
  	var margin = {top: 20, right: 0, bottom: 30, left: 0};
    // width = $('#viz3').width() - margin.left - margin.right,
    // height = $('#viz3').height() - margin.top - margin.bottom;
        
    var width = 400;
    var height = 300;
    
      
   //     $('#debug').text = "Vis 3 Width: " + width + " Height: " + height;
    $('#debug').text("Vis 3 Width: " + width + " Height: " + height);
        
    // Display formatting    
    var x = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

        
    // The line and what each axis represent    
    var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.win_rate); });
    
        // Add and format svg
    var svg = d3.select("#viz3graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  
      
        
    // Load data  
      d3.json("sample.json", function(data){
        /**
        * pull out date, champion name, win rate?
        */
        
      // Domain for each axis. 
      x.domain(d3.extent(data, function(d) { return /* time? d.date  */}));
      y.domain(d3.extent(data, function(d) { return /*  win rate? d.winrate */}));
      
      // Display x Axis and format
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("transform", "rotate(0)")
      .attr("y", 5)
      .attr("dy", "20px")
      .attr("dx", "80px")
      .style("text-anchor", "end")
      .text("X Axis text");

          // Display y Axis and format
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform","translate(6, 0)")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Axis text");  
      
          // Display each line in the graph
      svg.append("path")
        .datum(data)
        .attr("class","line")
        .attr("d",line);
      
    
    });
      
        
    }
    };

$(document).ready(function() {
  interaction.init();
  interaction.viz1();
//  interaction.viz2();
//  interaction.viz3();
});

