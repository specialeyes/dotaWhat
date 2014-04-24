/**
 * Created by Jennifer on 4/4/14.
 */
var DDgroupcount = 0;
var heroNames = [];
var svg1;
var svg2;

/* Creates the Drop downs for viz3 that hold the heroes' names and IDs. Creates by groups of 5 */

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

function generateHeroDropDown() {
    var HeroFile = 'heroes2.csv';
    var DDL = $("#groupSelectContainer");
    var suplist;
    var cols;
    $.get(HeroFile, function (data) {
        suplist = data.split('\n'),
        cols;
        DDL.append("<div id='group" + DDgroupcount + "' class='heroTeam'>Team " + DDgroupcount + "<br/></div>");

        for (var j = 1; j <= 5; j++) {
            if (j == 1) $("#group" + DDgroupcount).append("<select id='heroDD" + DDgroupcount + "" + j + "' class='heroDropDown'></select>");
            else $("#group" + DDgroupcount).append("<select id='heroDD" + DDgroupcount + "" + j + "' class='heroDropDown' style='display:none'></select>");
            for (var i = 0, len = suplist.length; i < len; i++) {
                cols = suplist[i].split(','); //split the line in columns
                //so  cols[0] -> ttt1111
                //and cols[1] -> John Doe
                //and so on for the rest lines
                $("#heroDD" + DDgroupcount + j).append("<option value='" + cols[0] + "'>" + cols[1] + "</option>").addClass("form-control");

            }
            $('#heroDD' + DDgroupcount + j).change(function () {
                //  interaction.viz2();
                //       heroNames.push(this.value);
                var hhh = this.id.charAt(this.id.length - 1) + this.id.charAt(this.id.length - 2);
                console.log("hhh " + hhh);
                console.log(this.id);
                console.log(this.id.charAt(this.id.length - 2));
                // heroNames[parseInt(this.id.charAt(this.id.length-1))+ parseInt(this.id.charAt(this.id.length-2))*5-1] = this.value;
                console.log(heroNames);
            });

        }


        DDgroupcount++;

    });
}


var interaction = {

    init: function () {

        generateHeroDropDown();
        generateHeroDropDown();
        generateHeroDropDown();
        generateHeroDropDown();

    },
    vizTitles: {
        titles: ["Parallel Coordinates", "Item Popularity", "Team Combination Winrate"],
        subtitles: ["So cool", "", ""]

    },
    documentSizes: {
        aspect: 1200 / 500
    },
    populateTable: function (players, heroNameMap, hoverFn, offHoverFn, isReload) {
        // Gets tbody within the table.
        var $bodySection = $("#matchTable").find("tbody"),
            $curEntry,
            isClicked = false;

        if (isReload) {
            $bodySection.children().remove();
        }

        console.log(heroNameMap);

        // For each player, creates a new row in the table
        players.forEach(function (player) {
            playerClicked = null;
            $curEntry = $("<tr/>")
                .hover(function () {
                    if (!isClicked) hoverFn.call(null, player);
                }, function () {
                    if (!isClicked) offHoverFn.call(null);
                })
                .click(function () {
                    if (!isClicked) {
                        isClicked = true;
                        hoverFn.call(null, player);
                        playerClicked = player;
                        $(this).addClass("tableClicked");
                    } else if (isClicked && playerClicked === player) {
                        isClicked = false;
                        playerClicked = null;
                        offHoverFn.call(null);
                        $(this).removeClass("tableClicked");
                    }
                });

            // For each property, retrieves the value for the player and appends it to the table-row element
            $curEntry.append("<td>" + heroNameMap[player["heroName"]] + "</td>");
      ["player", "lvl", "kills", "deaths", "assists", "gold",
        "lastHits", "denies", "XPM", "GPM", "HD", "HH", "TD"].forEach(function (propertyName) {
                $curEntry.append("<td>" + player[propertyName] + "</td>");
            });

            // Adds the row to the body of the table
            $curEntry.appendTo($bodySection);
        });
    },
    viz1: function (url, isReload) {
        if (isReload) {
            d3.select("#viz1graph").select("svg").remove();
        }

        // Document Elements
        var targetWidth = $("#viz1graph").width();
        var margin = {
            top: 30,
            right: 25,
            bottom: 30,
            left: 25
        },
            w = targetWidth - margin.right - margin.left,
            h = (targetWidth / interaction.documentSizes.aspect) - margin.top - margin.right;

        // Defining where vertical axes are going to be
        var x = d3.scale.ordinal().rangePoints([0, w], .5),
            y = {},
            dragging = {};

        // Instantiating variables
        var line = d3.svg.line(),
            axis = d3.svg.axis().orient("left"),
            background,
            foreground,
            dimensions,
            heroNameMap = {};

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
        var domainFn = function (players, property) {
            return d3.extent(players, function (player) {
                // console.log(player[property]);
                return player[property];
            });
        };

        // Loading data
        d3.json(url, function (curMatch) {
            allPlayers = curMatch["players"];

            d3.csv("heroes.csv", function (data) {
                data.forEach(function (hero) {
                    heroNameMap[hero["heroNameUnformatted"]] = hero["Heroes"];
                    console.log(hero);
                });

                interaction.populateTable(allPlayers, heroNameMap, hoverFn, offHoverFn, isReload);
            });

            // Show match # and winner
            var $vizTitle = $("#viz1").find("h2").text("Match #" + curMatch["mID"] + " ");
            $('<small>').text(function () {
                if (curMatch["radiantVictory"]) return "Radiant Victory";
                else return "Dire Victory";
            })
                .css("color", function () {
                    if (curMatch["radiantVictory"]) return "#61A013";
                    else return "#D6231C";
                }).appendTo($vizTitle);

            // Set domains (based on the data) for all the vertical axes
            dimensions = d3.keys(allPlayers[0]).filter(function (property) {
                return ((["player", "pID", "heroName", "radiant", "itemBuild"].indexOf(property) == -1) &&
                    (y[property] = d3.scale.linear().domain(domainFn.call(null, allPlayers, property)).range([h, 0])));
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
                .attr("stroke", function (d, i) {
                    if (allPlayers[i].radiant) return "#61A013";
                    else return "#D6231C";
                })
                .attr("d", path);

            // Group element for each dimension/vertical axis
            var g = svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function (d) {
                    return "translate(" + x(d) + ")";
                })
                .call(d3.behavior.drag()
                    .on("dragstart", function (d) {
                        dragging[d] = this.__origin__ = x(d);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function (d) {
                        dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                        foreground.attr("d", path);
                        dimensions.sort(function (a, b) {
                            return position(a) - position(b);
                        });
                        x.domain(dimensions);
                        g.attr("transform", function (d) {
                            return "translate(" + position(d) + ")";
                        })
                    })
                    .on("dragend", function (d) {
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
                .each(function (d) {
                    d3.select(this).call(axis.scale(y[d]));
                })
                .append("text")
                .attr("text-anchor", "middle")
                .attr("y", -9)
                .text(String);

            // Add and store brush for each axis.
            g.append("g")
                .attr("class", "parallelBrush")
                .each(function (d) {
                    d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush));
                })
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
            return line(dimensions.map(function (p) {
                return [x(p), y[p](d[p])];
            }));
        }

        // Handles brush event, toggling display of foreground lines
        function brush() {
            var actives = dimensions.filter(function (p) {
                return !y[p].brush.empty();
            }),
                extents = actives.map(function (p) {
                    return y[p].brush.extent();
                });

            foreground.style("display", function (d) {
                return actives.every(function (p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";
            });
        }

        function hoverFn(player) {
            foreground.style("display", function (d) {
                if (player["heroName"] === d["heroName"]) {
                    return null;
                }
                return "none";
            });
        }

        function offHoverFn() {
            brush();
        }



    },
    changeMatch: function () {
        var matchNumber = $("#matchID").val();
        var url = "matches/" + matchNumber + ".json";
        interaction.viz1(url, true);
    },
    viz2: function () {
        /**
         * Vis 2 Code
         */
        // Load data
        var dataSet = [];
        d3.json("heroItemWR/heroItemMap.json", function (data) {
            dataSet = data;
            // Document formatting
            var margin = {
                top: 50,
                right: 0,
                bottom: 5,
                left: 50
            };
            // var width = $('#viz2').width() - margin.left - margin.right;
            // var height = $('#viz2').height() - margin.top - margin.bottom;

            var width = 400;
            var height = 300;
            var radius = Math.min(width, height) / 2;

            // Pie slice colors
            var color = d3.scale.category20c();

            // Radius of the pies
            var arc = d3.svg.arc()
                .outerRadius(radius - 100)
                .innerRadius(20);
            /*
        var winrates =[];
    data["abaddon"].forEach(function(entry){
      winrates.push(entry.winrate);
        });    
        
        console.log(winrates);
*/
            // What the pies represent.
            var pie = d3.layout.pie()
                .value(function (d) {

                    return d.matches;
                }); /* what each slice represents */


            /* use nest() by hero to arrange each small multiple pie chart  */


            //    for (var hero in data) {
            //      heroNames.push(hero);
            //    }      
            //  console.log(heroNames);
            //   data.forEach(
            //        function(entry){
            //            heroNames.push(entry);
            //        }
            //    );
            /*
                var nodes = document.getElementById('groupSelectContainer').childNodes;
        console.log(nodes);
        for(var i=1; i<nodes.length; i++) {
                for(var j=2; j<nodes[i].childNodes.length;j++) {
                    heroNames.push(nodes[i].childNodes[j].value);
                }
            //    alert(nodes[i]);
}
    */
            //    heroNames = d3.keys(data);

            console.log(heroNames);
            // Each pie for every hero id
            var heroes = d3.nest()
                .key(function (d) {
                    return d.heroNames;
                }) /* Each hero or player identification. player_id */
                .entries(data);

            console.log(data);

            //    console.log(sad);

            //   console.log(data["abaddon"].forEach(function(element) {return element["winrate"];}));
            //  data["abaddon"].forEach(function(element){return element["winrate"]});
            //     console.log(data["abaddon"][0].winrate);

            //        data["abaddon"].forEach(function(entry){
            //        console.log(entry.winrate);
            //        });
            //        var asdd = []
            //    for (var hero in data) {
            //        asdd.push(hero);
            //        }      
            //       console.log(asdd);

            //      data.forEach(function(element) { asdd.push(element);});
            //        console.log(asdd);




            /*
        // add them to svg element. Format display
      var svg = d3.select("#vis2graph").append("svg")
       .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       
    var g = svg.selectAll(".arc")
        .data(pie(data["abaddon"]))
    .enter().append("g")
    .attr("class", "arc");
   */
            svg1 = d3.select("#vis2graph").selectAll("svg")
                .data(heroNames).enter().append("svg")
                .attr("display", "inline-block")
                .attr("width", radius - 15)
                .attr("height", radius)

            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg1.append("svg:text")
            //      .attr("text-anchor", "middle")
            .attr("y", 70)

            .text(function (d) {
                return d;
            });

            var g = svg1.selectAll(".arc")
                .data(function (d) {
                    return pie(data[d])
                })
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) {
                    return color(d.data.id)
                })
                .append("title")
                .text(function (d) {
                    return "" + d.data.itemName + " Winrate: " + d.data.winrate;
                });
            //     g.select("path").append("image").attr("src", function(d) { return d.data.itemImageURL});

            d3.selectAll('select').on("change", function (d, i) {

                $("#" + this.id.replaceAt(this.id.length - 1, "" + (parseInt(this.id.charAt(this.id.length - 1)) + 1))).show();


                heroNames[parseInt(this.id.charAt(this.id.length - 1)) + parseInt(this.id.charAt(this.id.length - 2)) * 5 - 1] = this.value;

                d3.select("#vis2graph").selectAll("svg").remove();
                svg1 = d3.select("#vis2graph").selectAll("svg").data(heroNames).enter()
                    .append("svg")
                    .attr("display", "inline-block")
                    .attr("width", radius - 15)
                    .attr("height", radius - 30)

                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg1.append("svg:text")
                    .attr("text-anchor", "middle")
                    .attr("y", "60")
                    .text(function (d) {
                        return d;
                    });

                //    dataCallback(data);
                g = svg1.selectAll(".arc").data(function (d) {

                    if (typeof data[d] != "undefined")
                    //        console.log(data[d]);
                        return pie(data[d]);
                    return pie(data["placeholder"]);
                })
                    .enter().append("g")
                    .attr("class", "arc");

                g.append("path")
                    .attr("d", arc)
                    .style("fill", function (d) {
                        return color(d.data.id)
                    })
                    .append("title")
                    .text(function (d) {
                        return "" + d.data.itemName + " Winrate: " + d.data.winrate;
                    });

                g.on("mouseover", function (d) {
                    var tempo = d3.selectAll('.arc');
                    var tstring;
                    var ystring;
                    for (var k = 0; k < tempo.select('title')[0].length; k++) {
                        tstring = tempo.select('title')[0][k].textContent;
                        ystring = d.data["itemName"];


                        if (tstring.substring(0, tstring.length - 15) == ystring)
                            d3.select(tempo[0][k]).style({
                                opacity: '1.0'
                            });
                        else
                            d3.select(tempo[0][k]).style({
                                opacity: '0.1'
                            });


                    }



                })
                    .on("mouseout", function (d) {

                        d3.selectAll('.arc').style({
                            opacity: '1.0'
                        });

                    })



                var tempcounter = 0;
                var tempcounter2 = 0; // when 5 increase team count

                var tempsvg = d3.select('#vis2graph').selectAll('svg')[0];
                console.log(tempsvg);
                for (var k = 0; k < tempsvg.length; k++) {
                    if (k % 5 == 0) {
                        tempcounter++;
                        tempcounter2 = 0
                    }
                    d3.select(tempsvg[k]).attr("class", "pie" + tempcounter + "" + tempcounter2);
                    tempcounter2++;

                }


                var tempp2 = d3.select('#vis2graph').selectAll('svg')[0];

                console.log(tempp2);
                for (var k = 0; k < tempp2.length; k++) {
                    console.log(tempp2[k].textContent.substring(0, 10));
                    if (tempp2[k].textContent.substring(0, 11) == "placeholder") {
                        d3.select(tempp2[k])
                            .style({
                                display: "none"
                            });
                        // alert("found");
                    } else {
                        d3.select(tempp2[k])
                            .style({
                                display: "inline-block"
                            });

                    }
                }


                // Vis 2 code end




                //alert("change!");



                //  d3.selectAll('select').on( {


                x = d3.scale.linear()
                    .range([0, 390]);

                y = d3.scale.linear()
                    .range([300, 0]);

                var line = d3.svg.line()
                    .x(function (d) {
                        return x(d[2]);
                    })
                    .y(function (d) {
                        if (d[0] != 0)
                            return y(d[1] / d[0]);
                        return y(0);
                    });

                x.domain([5, 90]);
                y.domain([0, 100]);

                //        color = d3.scale.category20c();

                console.log(d3.selectAll('.heroDropDown'));
                d3.select(".team1x").remove();
                d3.select(".team2x").remove();
                d3.select(".team3x").remove();
                d3.select(".team4x").remove();





                var filename1 = "";
                var sortedHeroes = heroNames.slice(0, 5).sort();
                //    console.log(heroNames);
                for (var z = 0; z < 5; z++) {
                    if (typeof sortedHeroes[z] != "undefined")
                        filename1 = filename1 + sortedHeroes[z];


                }

                var filename2 = "";
                sortedHeroes = heroNames.slice(5, 10).sort();
                //    console.log(heroNames);
                for (var z = 0; z < 5; z++) {
                    if (typeof sortedHeroes[z] != "undefined")
                        filename2 = filename2 + sortedHeroes[z];


                }
                var filename3 = "";
                sortedHeroes = heroNames.slice(10, 15).sort();
                //    console.log(heroNames);
                for (var z = 0; z < 5; z++) {
                    if (typeof sortedHeroes[z] != "undefined")
                        filename3 = filename3 + sortedHeroes[z];


                }
                var filename4 = "";
                sortedHeroes = heroNames.slice(15, 20).sort();
                //    console.log(heroNames);
                for (var z = 0; z < 5; z++) {
                    if (typeof sortedHeroes[z] != "undefined")
                        filename4 = filename4 + sortedHeroes[z];


                }


                filename1 = filename1 + ".json";
                filename2 = filename2 + ".json";
                filename3 = filename3 + ".json";
                filename4 = filename4 + ".json";
                console.log(filename1);
                console.log(filename2);
                console.log(filename3);
                console.log(filename4);

                if (filename1 == ".json") filename1 = "blah.json";
                if (filename2 == ".json") filename2 = "blah.json";
                if (filename3 == ".json") filename3 = "blah.json";
                if (filename4 == ".json") filename4 = "blah.json";
                console.log(filename1);
                queue()
                    .defer(d3.json, "transfer/" + filename1)
                    .defer(d3.json, "transfer/" + filename2)
                    .defer(d3.json, "transfer/" + filename3)
                    .defer(d3.json, "transfer/" + filename4)
                    .await(createLines);


                /*
            d3.select("#viz2graph").selectAll("svg").remove();
                svg = d3.select("#viz3graph").selectAll("svg").data(heroNames).enter()
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)

                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            */


                function createLines(error, team1, team2, team3, team4) {

                    var counter = 0;
                    var ph = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
                    ph = team1["winrates"];
                    console.log(ph);
                    for (var f = 1; f < ph.length + 1; f++) {
                        ph[f - 1][2] = (f * 5);

                    }

                    console.log(ph);


                    if (typeof team1 != "undefined") {
                        /*
                        for (var key in team1["winrates"]) {
                            if (team1["winrates"].hasOwnProperty(key)) {
                                ph[counter][0] = parseInt(key);
                                ph[counter][1] = team1["winrates"][0][key];
                            }
                            //   console.log(counter);
                            counter++;
                        }
                        */
                        //      console.log(ph);
                        var team1line = svg2
                            .selectAll(".team1x")
                            .data([ph])
                            .enter()
                            .append("g")
                            .attr("class", "team1x");
                        team1line.append("path")
                            .attr("class", "line")
                            .attr("d", function (d) {
                                console.log(d);
                                return line(d);
                            })
                            .style("stroke", function (d) {
                                return "blue";
                            })
                            .style("stroke-width", 3)
                            .style("fill", "none")
                            .append("title").classed("tooltip", true).text("Team0");


                    }


                    counter = 0;
                    ph = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
                    ph = team2["winrates"];
                    for (var f = 1; f < ph.length + 1; f++) {
                        ph[f - 1][2] = (f * 5);

                    }

                    console.log(team2);
                    /*
                    for (var key in team2["winrates"][0]) {
                        if (team2["winrates"][0].hasOwnProperty(key)) {
                            ph[counter][0] = parseInt(key);
                            ph[counter][1] = team2["winrates"][0][key];
                        }
                        //console.log(counter);
                        counter++;
                    }
                    //          console.log(ph);
  */

                    var team1line = svg2
                        .selectAll(".team2x")
                        .data([ph])
                        .enter()
                        .append("g")
                        .attr("class", "team2x");
                    team1line.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            //console.log(d);
                            return line(d);
                        })
                        .style("stroke", function (d) {
                            return "green";
                        })
                        .style("stroke-width", 3)
                        .style("fill", "none").append("title").classed("tooltip", true).text("Team1");



                    counter = 0;
                    ph = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
                    ph = team3["winrates"];
                    for (var f = 1; f < ph.length + 1; f++) {
                        ph[f - 1][2] = (f * 5);

                    }
                    /*
                    for (var key in team3["winrates"][0]) {
                        if (team3["winrates"][0].hasOwnProperty(key)) {
                            ph[counter][0] = parseInt(key);
                            ph[counter][1] = team3["winrates"][0][key];
                        }
                        //console.log(counter);
                        counter++;
                    }
                    //        console.log(ph);
  */
                    var team1line = svg2
                        .selectAll(".team3x")
                        .data([ph])
                        .enter()
                        .append("g")
                        .attr("class", "team3x");
                    team1line.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            //  console.log(d);
                            return line(d);
                        })
                        .style("stroke", function (d) {
                            return "red";
                        })
                        .style("stroke-width", 3)
                        .style("fill", "none").append("title").classed("tooltip", true).text("Team2");


                    counter = 0;
                    ph = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
                    ph = team4["winrates"];
                    for (var f = 1; f < ph.length + 1; f++) {
                        ph[f - 1][2] = (f * 5);

                    }

                    /*
                    for (var key in team4["winrates"][0]) {
                        if (team4["winrates"][0].hasOwnProperty(key)) {
                            ph[counter][0] = parseInt(key);
                            ph[counter][1] = team4["winrates"][0][key];
                        }
                        //console.log(counter);
                        counter++;
                    }
                    //  console.log(ph);
  */
                    var team1line = svg2
                        .selectAll(".team4x")
                        .data([ph])
                        .enter()
                        .append("g")
                        .attr("class", "team4x");
                    team1line.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            //  console.log(d);
                            return line(d);
                        })
                        .style("stroke", function (d) {
                            return "black";
                        })
                        .style("stroke-width", 3)
                        .style("fill", "none").append("title").classed("tooltip", true).text("Team3");



                    d3.selectAll('.line').on("click", function () {

                        console.log(this);
                        var tempp = d3.selectAll('.line')[0];
                        for (var n = 0; n < tempp.length; n++) {
                            d3.select(tempp[n]).style({
                                opacity: 0.2
                            });

                        }
                        d3.select(this).style({
                            opacity: 1.0
                        });

                        var tempp2 = d3.select('#vis2graph').selectAll('svg')[0];
                        var tempString = d3.select(this).select('title')[0][0].innerHTML;

                        console.log(tempp2);
                        for (var k = 0; k < tempp2.length; k++) {
                            if (!(parseInt(tempp2[k].classList[0].charAt(3)) == (parseInt(tempString.charAt(4)) + 1))) {
                                d3.select(tempp2[k])
                                    .style({
                                        opacity: 0.2
                                    });
                                // alert("found");
                            } else {
                                d3.select(tempp2[k])
                                    .style({
                                        opacity: 1.0
                                    });

                            }
                        }


                    });


                    var color_hash = {
                        0: ["Team0", "blue"],
                        1: ["Team1", "green"],
                        2: ["Team2", "red"],
                        3: ["Team3", "black"]
                    };
                    var teamss = [0, 1, 2, 3];

                    var legend = svg2.append("g")
                        .attr("class", "legend")
                    //.attr("x", w - 65)
                    //.attr("y", 50)
                    .attr("height", 100)
                        .attr("width", 100)
                        .attr('transform', 'translate(10,0)');

                    legend.selectAll('rect')
                        .data(teamss)
                        .enter()
                        .append("rect")
                        .attr("x", 400 - 65)
                        .attr("y", function (d, i) {
                            return i * 17;
                        })
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", function (d) {
                            var colors = color_hash[d][1];
                            return colors;
                        });

                    legend.selectAll('text')
                        .data(teamss)
                        .enter()
                        .append("text")
                        .attr("x", 400 - 52)
                        .attr("y", function (d, i) {
                            return i * 17 + 9;
                        })
                        .text(function (d) {
                            var text = color_hash[d][0];
                            return text;
                        });



                };
            });




        });




    },
    viz3: function () {
        /**
         * Vis 3 Code
         */
        var margin = {
            top: 20,
            right: 0,
            bottom: 30,
            left: 0
        };
        // var width = $('#viz3').width() - margin.left - margin.right;
        // height = $('#viz3').height() - margin.top - margin.bottom;

        var width = 400;
        var height = 300;


        // $('#debug').text = "Vis 3 Width: " + width + " Height: " + height;
        // $('#debug').text("Vis 3 Width: " + width + " Height: " + height);

        // Display formatting
        var x = d3.scale.linear()
            .range([0, 390]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        //      var color = d3.scale.category10();

        // The line and what each axis represent
        var line = d3.svg.line()
            .x(function (d) {
                return x(d[0]);
            })
            .y(function (d) {
                return y(d[1]);
            });

        // Add and format svg
        svg2 = d3.select("#viz3graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Load data

        /**
         * pull out date, champion name, win rate?
         */

        x.domain([5, 90]);
        y.domain([0, 100]);



        /*
            // Domain for each axis.
            x.domain(d3.extent(data, function (d) {
                return 
            }));
            y.domain(d3.extent(data, function (d) {
                return 
            }));
*/
        // Display x Axis and format
        svg2.append("g")
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
        svg2.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(6, 0)")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Axis text");

        /*
            // Display each line in the graph
            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);
*/




        //   d3.select('#vis3button').on("click", function (d, i) {


        //        });






    }
};

$(document).ready(function () {
    interaction.init();
    interaction.viz1("rankedGame.json", false);
    interaction.viz2();
    interaction.viz3();
});