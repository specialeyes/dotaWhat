/**
 * Created by Jennifer on 4/4/14.
 */
var DDgroupcount = 1;

/* Creates the Drop downs for viz3 that hold the heroes' names and IDs. Creates by groups of 5 */
function generateHeroDropDown() {
    var HeroFile='heroes.csv';
    var DDL = $("#groupSelectContainer");
    var suplist;
    var cols;
    $.get( HeroFile, function(data) {
        suplist = data.split('\n'),
            cols;
        DDL.append("<div id='group" + DDgroupcount + "' class='heroTeam'>Team " + DDgroupcount +  "<br/></div>");
        
        for(var j= 1; j <= 5; j++) {
            $("#group" + DDgroupcount).append("<select id='heroDD" + DDgroupcount + j + "' class='heroDropDown'></select>");
            for (var i=0, len=suplist.length; i<len; i++) {
                cols = suplist[i].split(','); //split the line in columns
                                          //so  cols[0] -> ttt1111
                                          //and cols[1] -> John Doe
                                          //and so on for the rest lines
                $("#heroDD" + DDgroupcount + j).append("<option value='" + cols[0] + "'>" + cols[1] + "</option>");
            }
        }
        DDgroupcount++;
    
    });
}


var interaction = {

  init: function() {

      generateHeroDropDown();
      
  	
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
  populateTable: function(players, hoverFn) {
    // Gets tbody within the table.
    var $bodySection = $("#matchTable").find("tbody"),
      $curEntry;

    // For each player, creates a new row in the table
    players.forEach(function(player) {
      $curEntry = $("<tr/>")
        .hover(hoverFn.bind(null, player));

      // For each property, retrieves the value for the player and appends it to the table-row element
      ["heroName", "player", "lvl", "kills", "deaths", "assists", "gold",
        "lastHits", "denies", "XPM", "GPM", "HD", "HH", "TD"].forEach(function (propertyName) {
          $curEntry.append("<td>" + player[propertyName] + "</td>");
        });

      // Adds the row to the body of the table
      $curEntry.appendTo($bodySection);
    });
  },
    viz1: function() {
      // Document Elements
      var margin = {top: 30, right: 25, bottom: 30, left: 25},
        w = 1150 - margin.right - margin.left,
        h = 500 - margin.top - margin.right;

      // Defining where vertical axes are going to be
      var x = d3.scale.ordinal().rangePoints([0, w],.5),
        y = {},
        dragging = {};

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
      d3.json("rankedgame.json", function (curMatch) {
        allPlayers = curMatch["players"];
        interaction.populateTable(allPlayers, hoverFn);

        // Show match # and winner
        var $vizTitle = $("#viz1").find("h2").text("Match #" + curMatch["mID"]+ " ");
        $('<small>').text(function() {
            if (curMatch["radiantVictory"]) return "Radiant Victory";
            else return "Dire Victory";
          })
          .css("color", function() {
            if (curMatch["radiantVictory"]) return "#61A013";
            else return "#D6231C";
          }).appendTo($vizTitle);

        // Set domains (based on the data) for all the vertical axes
        dimensions = d3.keys(allPlayers[0]).filter(function(property) {
          return ((["player", "pID", "heroName", "radiant", "itemBuild"].indexOf(property) == -1) &&
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
            if (allPlayers[i].radiant) return "#61A013";
            else return "#D6231C";
          })
          .attr("d", path);

        // Group element for each dimension/vertical axis
        var g = svg.selectAll(".dimension")
          .data(dimensions)
          .enter().append("g")
          .attr("class", "dimension")
          .attr("transform", function(d) {return "translate(" + x(d) + ")"; })
          .call(d3.behavior.drag()
            .on("dragstart", function(d) {
              dragging[d] = this.__origin__ = x(d);
              background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
              dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
              foreground.attr("d", path);
              dimensions.sort(function(a, b) { return position(a) - position(b); });
              x.domain(dimensions);
              g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function(d) {
              delete this.__origin__;
              delete dragging[d];
              transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
              transition(foreground)
                .attr("d", path);
              background
                .attr("d", path)
                .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
            }));

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

      // Helper function for giving a position to resort based on order of axes
      function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }

      // Transition function for dragging.
      function transition(g) {
        return g.transition().duration(500);
      }

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

      function hoverFn(player) {
        foreground.style("display", function(d) {
          if (player["heroName"] === d["heroName"]) {
            return null;
          }
          return "none";
        });
      }

    },
    viz2: function() {
    /**
    * Vis 2 Code
    */
    
    // Document formatting
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
 interaction.viz3();
});

