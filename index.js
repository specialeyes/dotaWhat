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
    viz1: function() {},
    viz2: function() {
    /**
    * Vis 2 Code
    */
    
        var margin = {top: 20, right: 0, bottom: 30, left: 0};
    var width = $('#viz2').width() - margin.left - margin.right;
    var height = $('#viz2').height() - margin.top - margin.bottom;
    var radius = Math.min(width, height)/2;
    
        width= 400;
        height = 300;
        
    var color = d3.scale.category20c();
    
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);
    
    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.winrate; }); /* what each slice represents */
    
    
        /* use nest() by hero to arrange each small multiple pie chart  */
    
    d3.json("sample.json", function(data) {
      var heroes = d3.nest()
        .key(function(d) {return d.hero_id /* Each hero or player identification. player_id */})
        .entries(data);
    
      var svg = d3.select("#vis2graph").selectAll("svg")
       .data(heroes)
       .enter().append("svg")
       .style("display", "inline-block")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
      .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        var g = svg.selectAll("g")
            .data(function (d) {return  /* pie(d. % item_win_rate)  */ ; })
            .enter().append("svg:g");
        
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
  	var margin = {top: 20, right: 0, bottom: 30, left: 0},
    width = $('#viz3').width() - margin.left - margin.right,
    height = $('#viz3').height() - margin.top - margin.bottom;
        
        width = 400;
        height = 300;
    
      
   //     $('#debug').text = "Vis 3 Width: " + width + " Height: " + height;
        $('#debug').text("Vis 3 Width: " + width + " Height: " + height);
        console.log("Blah");
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

    var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.win_rate); });
    
    var svg = d3.select("#viz3graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  
      
      
      d3.json("sample.json", function(data){
        /**
        * pull out date, champion name, win rate?
        */
        
      
      x.domain(d3.extent(data, function(d) { return /* time? d.date  */}));
      y.domain(d3.extent(data, function(d) { return /*  win rate? d.winrate */}));
      
      
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
      
      svg.append("path")
        .datum(data)
        .attr("class","line")
        .attr("d",line);
      
    
    });
      
        
    }
    };

$(document).ready(interaction.init);
$(document).ready(interaction.viz2);
$(document).ready(interaction.viz3);