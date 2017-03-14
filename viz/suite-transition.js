var width = 720,
           height = 720,
           outerRadius = Math.min(width, height) / 2 - 10,
           innerRadius = outerRadius - 24;

//var formatPercent = d3.format(".1%");
var formatPercent = function (val) { return val; }

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var layout = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

var path = d3.svg.chord()
    .radius(innerRadius);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.append("circle")
    .attr("r", outerRadius);
var tooltip = d3.select("#main").append("div").attr("class", "tooltip").style("opacity", 0);

//region_list = { "AMEA": true, "Americas": true, "China": true, "Europe": true, "Japan": true };
region_list = [
    { "name": "All", "isShow": true },
    { "name": "AMEA", "isShow": false },
    { "name": "Americas", "isShow": false },
    { "name": "China", "isShow": false },
    { "name": "Europe", "isShow": false },
    { "name": "Japan", "isShow": false },
    { "name": "US", "isShow": false }];
//seat_range_list = ["1-100", "101-500", "501-5000", "5001-100000", "100000+"];
seat_range_list = [{ "name": "1-100", "isShow": true },
    { "name": "101-500", "isShow": true },
    { "name": "500+", "isShow": true }];
    //{ "name": "501-5000", "isShow": true },
    //{ "name": "5001-100000", "isShow": true },
    //{ "name": "100000+", "isShow": true }];

transition_list = [
    { "name": "2013", "isShow": false },
    { "name": "2014", "isShow": false },
    { "name": "2015", "isShow": false },
    { "name": "2016", "isShow": true },
    { "name": "2017", "isShow": false },
];
var matrix_data;
var suites;
var selectedYear = 2016;
var selectedRegion = "All";
drawRegion(region_list);
drawTransition(transition_list);
drawSeatRange();
drawChart("../data/suite-transition.json");
//queue()
//    .defer(d3.csv, "../data/suites.csv")
//    .defer(d3.json, "../data/suitetransition.json")
//    .await(ready);

function drawRegion(list_data) {
    var dropDown = d3.select("#regionList").append("select").attr("name", "ddlRegion");
    var options = dropDown.selectAll("option")
                    .data(list_data)
                    .enter()
                    .append("option");
    options.text(function (d) { return d.name; })
            .attr("value", function (d) { return d.name; })
            .property("selected", function (d) {
                //console.log(d.name);
                //console.log(selectedYear);
                if (d.name == selectedRegion) {
                    return "selected";
                }
            });
    dropDown.on("change", function () {
        selectedRegion = d3.event.target.value;
        draw();
        //console.log(selectedValue);
    });

    //var legend = d3.select("#regionList");
    //var sub_div = legend.selectAll("div").data(region_list).enter()
    //    .append("label");
    //sub_div.append("input")
    //    .attr("type", "radio")
    //    .property("checked", function (d) { return d.isShow; })
    //    .attr("name", "rdoRegion")
    //    .attr("value", function (d, i) { return d.name; })
    //    .on("click", function (d) {
    //        //console.log(d.name);
    //        selectedRegion = d.name;
    //        //d.isShow = !d.isShow;
    //        //console.log(d.name);
    //        //drawChart();
    //        //var _region = "-" + d.name;
    //        //if (d.name == "All")
    //        //    _region = "";
    //        //console.log(d.name);
    //        //console.log(matrix_data.length);
    //        //var main_matrix = undefined;// = matrix_data[0].matrix;
    //        //for (var i = 0; i < matrix_data.length; i++) {
    //        //    //console.log(matrix_data[i].region);
    //        //    if (matrix_data[i].region == d.name || d.name == "All") {
    //        //        if (main_matrix == undefined) {
    //        //            main_matrix = matrix_data[i].matrix;
    //        //        } else {
    //        //            main_matrix = matrixAddition(main_matrix, matrix_data[i].matrix);
    //        //        }
    //        //    }
    //        //}
    //        //var _matrix = matrix_data[1].matrix;
    //        draw();
    //        //drawChart("../data/suitetransition" + _region + ".json");
           
    //    });
    //sub_div.append("span").text(function (d) { return d.name; });
}

function showSeatList() {
    var _txt = "";
    for (var i = 0; i < seat_range_list.length; i++) {
        if (seat_range_list[i].isShow) {
            _txt += "<span class='tag'>" + seat_range_list[i].name + "</span>";
        }
    }
    if (_txt == "")
        _txt = "[Empty]";
    d3.select("#seatList").html(_txt);
}
function drawSeatRange() {
    d3.select("#seatList").on("click", function () {
        //console.log("click : " + d3.select("#ddlSeat").style("display"));
        d3.select("#ddlSeat").style("display", function () { return (d3.select("#ddlSeat").style("display") == "none" ? "" : "none"); });
    });
    showSeatList();
    
    var list_obj = d3.select("#ddlSeat").classed("ddl", true).style("display","none");
    var lbls = list_obj.append("ul").selectAll("li").data(seat_range_list).enter()
           .append("li").append("label");
    lbls.append("input")
        .attr("type", "checkbox")
        .attr("checked", function (d) { return (d.isShow ? "checked" : ""); })
        .attr("value", function (d, i) { return d.name; })
        .on("click", function (d) {
            d.isShow = !d.isShow;
            showSeatList();
            draw();
        });;
    lbls.append("span").text(function (d) { return d.name; });
    //var legend = d3.select("#seatRangeList");
    //var sub_div = legend.selectAll("div").data(seat_range_list).enter()
    //    .append("label");
    //sub_div.append("input")
    //    .attr("type", "checkbox")
    //    .attr("checked", function (d) { return (d.isShow ? "checked" : ""); })
    //    .attr("value", function (d, i) { return d.name; })
    //    //.attr("disabled", "true")
    //    .on("click", function (d) {
    //        d.isShow = !d.isShow;
    //        //console.log(d);

    //        var _seatlist = [];
    //        for (var i = 0; i < seat_range_list.length; i++) {
    //            if (seat_range_list[i].isShow)
    //                _seatlist.push(seat_range_list[i].name);
    //        }
    //        d3.select("#seatList").text(_seatlist.join());

    //        draw();
    //    });
    //sub_div.append("span").text(function (d) { return d.name; });

    //var sub_div = legend.selectAll("div").data(seat_range_list).enter().append("div");
    //sub_div.text(function (d) { return d; });
}
function drawTransition(list_data) {
    var dropDown = d3.select("#transitionList").append("select").attr("name", "ddlYear");
    var options = dropDown.selectAll("option")
                    .data(list_data)
                    .enter()
                    .append("option");
    options.text(function (d) { return d.name; })
            .attr("value", function (d) { return d.name; })
            .property("selected", function (d) {
                //console.log(d.name);
                //console.log(selectedYear);
                if (d.name == selectedYear) {
                    return "selected";
                }
            });
    dropDown.on("change", function () {
        selectedYear = d3.event.target.value;
        draw();
        //console.log(selectedValue);
    });

    //var list_div = d3.select("#transitionList");
    //var sub_div = list_div.selectAll("div")
    //    .data(list_data).enter().append("label");
    //sub_div.append("input")
    //    .attr("type", "radio")
    //    .property("checked", function (d) { return d.isShow; })
    //    .attr("name", "rdoTransition")
    //    .attr("value", function (d, i) { return d.name; })
    //    .on("click", function (d) {
    //        //console.log(d.name);
    //        selectedYear = d.name;
    //        draw();
    //    });
    //sub_div.append("span").text(function (d) { return d.name; });
}

function drawLegend(data) {
    var legend = d3.select("#legendList");
    var sub_div = legend.selectAll("div").data(data).enter().append("div");
    sub_div.style("background-color", function (d) { return "#" + d.color; }).text(function (d) { return d.name; });

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    //var li = {
    //    w: 350, h: 30, s: 3, r: 3
    //};
    //var legend = d3.select("#legend").append("svg:svg")
    //    .attr("width", li.w)
    //    .attr("height", suites.length * (li.h + li.s));
    //var g = legend.selectAll("g")
    //    .data(suites)
    //    .enter().append("svg:g")
    //    .attr("transform", function (d, i) {
    //        return "translate(0," + i * (li.h + li.s) + ")";
    //    });
    //g.append("svg:rect")
    //    .attr("rx", li.r)
    //    .attr("ry", li.r)
    //    .attr("width", li.w)
    //    .attr("height", li.h)
    //    .style("fill", function (d) { return d.color; });
    //g.append("svg:text")
    //    .attr("x", li.w / 2)
    //    .attr("y", li.h / 2)
    //    .attr("dy", "0.35em")
    //    .attr("text-anchor", "middle")
    //    .text(function (d) { return d.name; });
}

function toggleLegend() {
    var legend = d3.select(".legendList");
    if (legend.style("display") == "none") {
        legend.style("display", "");
    } else {
        legend.style("display", "none");
    }
    //if (legend.style("visibility") == "hidden") {
    //    legend.style("visibility", "");
    //} else {
    //    legend.style("visibility", "hidden");
    //}
}


function drawChart(matrixfile) {
    queue()
        .defer(d3.csv, "../data/suites.csv")
        .defer(d3.json, matrixfile)
        .await(ready);
}
//function matrixAddition(a, b) {
//    return a.map(function (n, i) {
//        return n.map(function (o, j) {
//            return o + b[i][j];
//        });
//    });
//}

function ShowMessage(msg, isShow) {

    var panel = d3.select("#main > #msg");
    //console.log(panel);
    if (panel.empty()) {
        panel = d3.select("#main").append("div").attr("id", "msg").classed("msgpanel", true);
    }
    panel.text(msg);
    panel.style("display", function () { return (isShow ? "" : "none") });
}

function filter_data() {
    var main_matrix = undefined;
    var _seatlist = [];
    for (var i = 0; i < seat_range_list.length; i++) {
        if (seat_range_list[i].isShow) {
            if (seat_range_list[i].name == "500+") {
                _seatlist.push("501-5000");
                _seatlist.push("5001-100000");
                _seatlist.push("100000+");
            } else {
                _seatlist.push(seat_range_list[i].name);
            }
            
        }
            
    }
    //console.log(_seatlist.indexOf("1-100"));
    //console.log(_seatlist);
    for (var i = 0; i < matrix_data.length; i++) {
        if ((matrix_data[i].year == selectedYear) && (matrix_data[i].region == selectedRegion || selectedRegion == "All")) {
            if (_seatlist.indexOf(matrix_data[i].seat_range) >= 0) {
                if (main_matrix == undefined) {
                    main_matrix = matrix_data[i].matrix;
                } else {
                    main_matrix = math.add(main_matrix, matrix_data[i].matrix);
                    //main_matrix = matrixAddition(main_matrix, matrix_data[i].matrix);
                }
            }
        }
    }
    return main_matrix;
}

function ClearChart() {
    svg.selectAll(".group").remove();
    svg.selectAll(".chord").remove();
}

function draw() {
    var main_matrix = filter_data();
    //var main_matrix = undefined;
    //var _seatlist = [];
    //for (var i = 0; i < seat_range_list.length; i++) {
    //    if (seat_range_list[i].isShow)
    //        _seatlist.push(seat_range_list[i].name);
    //}
    ////console.log(_seatlist.indexOf("1-100"));
    ////console.log(_seatlist);
    //for (var i = 0; i < matrix_data.length; i++) {
    //    if ((matrix_data[i].year == selectedYear) && (matrix_data[i].region == selectedRegion || selectedRegion == "All")) {
    //        if (_seatlist.indexOf(matrix_data[i].seat_range) >= 0) {
    //            if (main_matrix == undefined) {
    //                main_matrix = matrix_data[i].matrix;
    //            } else {
    //                main_matrix = matrixAddition(main_matrix, matrix_data[i].matrix);
    //            }
    //        }
    //    }
    //}
    //console.log(math.sum(main_matrix));
    //console.log(main_matrix);

    ClearChart();

    if (main_matrix == undefined || main_matrix.length <= 0 || math.sum(main_matrix) <= 0) {
        ShowMessage("No data with this condition.", true);
        return;
    }
    ShowMessage("", false);
    //drawLegend(suites);
    //d3.select("#togglelegend").on("click", toggleLegend);
    // Compute the chord layout.
    layout.matrix(main_matrix);

    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

    // Add a mouseover title.
    //group.append("title").text(function (d, i) {
    //    return suites[i].name + ": " + formatPercent(d.value) + " of origins";
    //});

    // Add the group arc.
    var groupPath = group.append("path")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d3.select(this).attr("data-title").replace(/\n/g, "<br />"))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("id", function (d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function (d, i) { return suites[i].color; })
        .attr("data-title", function (d, i) {
            //console.log(d);
            //console.log(d);
            //console.log(math.sum(main_matrix[d.index]));
            //console.log(math.sum(math.subset(main_matrix, math.index(math.range(0, main_matrix.length), d.index))));
            var movein = math.sum(math.subset(main_matrix, math.index(math.range(0, main_matrix.length), d.index)));

            return suites[i].name + " : \n" + formatPercent(d.value) + " customers move out\n"
                               + formatPercent(movein) + " customers move in";
        });

    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .style("pointer-events","none")
        .attr("xlink:href", function (d, i) { return "#group" + i; })
        .text(function (d, i) { return suites[i].name; });

    // Remove the labels that don't fit. :(
    groupText.filter(function (d, i) {
        if (groupPath[0][i].getTotalLength() / 2 - 24 < this.getComputedTextLength()) {
            d3.select(this).select("textPath").text(suites[i].abbr);
            return (groupPath[0][i].getTotalLength() / 2 - 24 < this.getComputedTextLength());
        } else {
            return false;
        }
    }).remove();

    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .on("mouseover", function (d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d3.select(this).attr("data-title").replace(/\n/g, "<br />"))
                //.style("background-color", function () {
                //    return "#" + suites[d.source.index].color;
                //})
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("class", "chord")
        .style("fill", function (d) { return suites[d.source.index].color; })
        .attr("d", path)
        .attr("data-title", function (d, i) {
            return suites[d.source.index].name
                + " → " + suites[d.target.index].name
                + ": " + formatPercent(d.source.value)
                + "\n" + suites[d.target.index].name
                + " → " + suites[d.source.index].name
                + ": " + formatPercent(d.target.value);
        });

    // Add an elaborate mouseover title for each chord.
    //chord.append("title").text(function (d) {
    //    return suites[d.source.index].name
    //        + " → " + suites[d.target.index].name
    //        + ": " + formatPercent(d.source.value)
    //        + "\n" + suites[d.target.index].name
    //        + " → " + suites[d.source.index].name
    //        + ": " + formatPercent(d.target.value);
    //});

    function mouseover(d, i) {
        chord.classed("fade", function (p) {
            return p.source.index != i
                && p.target.index != i;
        });
    }
}


function ready(error, _suites, matrix) {
    //function ready(error, matrix) {
    if (error) throw error;

    matrix_data = matrix;
    suites = _suites;
    drawLegend(suites);
    d3.select("#togglelegend").on("click", toggleLegend);

    draw();
    return;

    // Compute the chord layout.
    console.log(main_matrix);
    layout.matrix(main_matrix);
    //layout.matrix(matrix[0].matrix);

    svg.selectAll(".group").remove();
    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

    // Add a mouseover title.
    //group.append("title").text(function (d, i) {
    //    return suites[i].name + ": " + formatPercent(d.value) + " of origins";
    //});

    // Add the group arc.
    var groupPath = group.append("path")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d3.select(this).attr("data-title"))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("id", function (d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function (d, i) { return suites[i].color; })
        .attr("data-title", function (d, i) { return suites[i].name + ": " + formatPercent(d.value) + " of origins"; });

    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("xlink:href", function (d, i) { return "#group" + i; })
        .text(function (d, i) { return suites[i].name; });

    // Remove the labels that don't fit. :(
    groupText.filter(function (d, i) {
        if (groupPath[0][i].getTotalLength() / 2 - 24 < this.getComputedTextLength()) {
            d3.select(this).select("textPath").text(suites[i].abbr);
            return (groupPath[0][i].getTotalLength() / 2 - 24 < this.getComputedTextLength());
        } else {
            return false;
        }
    }).remove();

    svg.selectAll(".chord").remove();
    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .on("mouseover", function (d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d3.select(this).attr("data-title").replace('\n', "<br />"))
                //.style("background-color", function () {
                //    return "#" + suites[d.source.index].color;
                //})
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("class", "chord")
        .style("fill", function (d) { return suites[d.source.index].color; })
        .attr("d", path)
        .attr("data-title", function (d, i) {
            return suites[d.source.index].name
                + " → " + suites[d.target.index].name
                + ": " + formatPercent(d.source.value)
                + "\n" + suites[d.target.index].name
                + " → " + suites[d.source.index].name
                + ": " + formatPercent(d.target.value);
        });

    // Add an elaborate mouseover title for each chord.
    //chord.append("title").text(function (d) {
    //    return suites[d.source.index].name
    //        + " → " + suites[d.target.index].name
    //        + ": " + formatPercent(d.source.value)
    //        + "\n" + suites[d.target.index].name
    //        + " → " + suites[d.source.index].name
    //        + ": " + formatPercent(d.target.value);
    //});

    function mouseover(d, i) {
        chord.classed("fade", function (p) {
            return p.source.index != i
                && p.target.index != i;
        });
    }
}
