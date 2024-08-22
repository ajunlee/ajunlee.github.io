// Dimensions of sunburst.
var width = 800;
var height = 600;
//var radius = Math.min(width, height) / 2;
var radius = 450;
var selected_list = [];
// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: 230, h: 30, s: 3, t: 10
};

var displayUnit = 0;
var selectedRegion = "All";


// Mapping of step names to colors.
var colors = {
    "Control Manager": "FFC81E",
    "Cloud App Security": "FF0000",
    "Hosted Email Security": "FF3232",
    "IM Security": "FF5050",
    "IMSVA": "FF6464",
    "Portal Protect": "FF6E6E",
    "SMEX": "FF8282",
    "SMID": "F08C8C",
    "Endpoint Application Control": "800080",
    "Endpoint Encryption": "960A96",
    "OfficeScan": "A83CA8",
    "OfficeScan Plug-in DLP": "A30FE2",
    "OfficeScan Plug-in Security for Mac": "AD46E0",
    "OfficeScan Plug-in VDI": "D36EEC",
    "Vulnerability Protection": "F88EF4",
    "Mobile Security": "46649B",
    "Server Protect for Linux": "50D6FF",
    "Server Protect for Windows/NetWare": "78EAFF",
    "IWSaas": "AE5E1A",
    "IWSVA": "D27D32",
    "Worry-Free Business Security Service": "7AF67A",
    "end": "EEEEEE"
};
var region_list = [
    { "name": "All", "isShow": true },
    { "name": "AMEA", "isShow": false },
    { "name": "Americas", "isShow": false },
    { "name": "Europe", "isShow": false }
];
var seat_range_list = [{ "name": "1-100", "isShow": true },
    { "name": "101-500", "isShow": true },
    { "name": "500+", "isShow": true }];

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 2])
    .on("zoom", zoomed);

function zoomed() {
    vis.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + d3.event.scale + ")");
}

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .call(zoom);

//var vis = d3.select("#chart").append("svg:svg")
//    .attr("width", width)
//    .attr("height", height)
//    .append("svg:g")
//    .attr("id", "container")
//    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function (d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function (d) { return d.x; })
    .endAngle(function (d) { return d.x + d.dx; })
    .innerRadius(function (d) { return Math.sqrt(d.y); })
    .outerRadius(function (d) { return Math.sqrt(d.y + d.dy); });

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

    // Basic setup of page elements.
    //initializeBreadcrumbTrail();
    //drawLegend();
    

    vis.selectAll("svg > g > circle").remove();
    vis.selectAll("svg > g > path").remove();

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition.nodes(json)
        .filter(function (d) {
            return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function (d) { return colors[d.name]; })
        .style("opacity", 1)
        .on("mouseover", mouseover)
        .on("click", mouseclick);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
    d3.select("#totalCount").text(totalSize);
};

function displayUnitData(_val, _totalSize) {
    var percentageString;
    if (displayUnit != 1) {
        var percentage = (100 * _val / _totalSize).toPrecision(3);
        percentageString = percentage + "%";
        if (percentage < 0.1) {
            percentageString = "< 0.1%";
        }
    } else {
        percentageString = _val;
    }
    return percentageString;
}
// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
    var percentageString = displayUnitData(d.value, totalSize);
    //if (displayUnit != 1) {
    //    var percentage = (100 * d.value / totalSize).toPrecision(3);
    //    percentageString = percentage + "%";
    //    if (percentage < 0.1) {
    //        percentageString = "< 0.1%";
    //    }
    //} else {
    //    percentageString = d.value;
    //}
    //var percentage = (100 * d.value / totalSize).toPrecision(3);
    //var percentageString = percentage + "%";
    //if (percentage < 0.1) {
    //    percentageString = "< 0.1%";
    //}

    d3.select("#percentage")
        .text(percentageString);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = getAncestors(d);
    updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll("path:not(.selected)")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function (node) {
            return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .each("end", function () {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#explanation")
        .style("visibility", "hidden");
}


function append_selected_list(item) {
    var _isExisting = false;
    selected_list.forEach(function (d, i) {
        if (item.name == d.name && item.value == d.value && item.depth == d.depth) {
            _isExisting = true;
            return;
        }
    });
    if (!_isExisting) {
        selected_list.push(item)
    }
    return _isExisting;
}
function remove_selected_list(name, depth, value) {
    for (var i = 0; i < selected_list.length; i++) {
        var item = selected_list[i];
        //console.log(name);
        //console.log(depth);
        //console.log(value);
        //console.log(item);
        if (item.name == name && item.value == value && item.depth == depth) {
            //console.log("done");
            selected_list.splice(i, 1);
            break;
        }
    }
}

function clean_selected_list() {
    d3.selectAll("path.selected").classed("selected", false);
    selected_list = [];
    drawSelectedList();
}
function drawSelectedList() {
    d3.select("#grid").html("");
    //selected_list.sort(function (a, b) { return (a.depth > b.depth) ? 1 : ((b.depth > a.depth) ? -1 : 0); });

    selected_list.forEach(function (d, i) {
        var percentageString = displayUnitData(d.value, totalSize);
        //if (displayUnit != 1) {
        //    var percentage = (100 * d.value / totalSize).toPrecision(3);
        //    percentageString = percentage + "%";
        //    if (percentage < 0.1) {
        //        percentageString = "< 0.1%";
        //    }
        //} else {
        //    percentageString = d.value;
        //}
        //console.log(percentageString);
        var _div = d3.select("#grid").append("div").classed("gridDiv", true);
        //_div.append("span").classed("gridAct", true).text("X").attr("data", d.name + ";" + d.depth + ";" + d.value).on("click", function () {
        //    remove_selected_list(d.name, d.depth, d.value);
        //    //d3.select(this.parentNode).remove();
        //    drawSelectedList();
        //});
        var sequenceArray = getAncestors(d);
        //console.log(sequenceArray);
        _div.append("span").text(percentageString + " : ").classed("gridSpan", true).style("width", "60px");
        _div.append("span").text("Round " + d.depth).classed("gridSpan", true).style("width", "80px");
        sequenceArray.forEach(function (d, i) {
            if (d.name == "end") {
                _div.append("span").text(d.name).classed("gridProd", true).style("background-color", function () { return "#999"; });
            }
            else {
                _div.append("span").text(d.name).classed("gridProd", true).style("background-color", function () { return "#" + colors[d.name]; });
                //if ((sequenceArray.length - 1) != i) {
                //    _div.append("span").classed("gridSpan", true).text(" > ");
                //}
            }
        });
    });
}

function mouseclick(d) {
    //var _isExisting = false;
    //selected_list.forEach(function (item, i) {
    //    if (item.name == d.name && item.value == d.value && item.depth == d.depth){
    //        _isExisting = true;
    //        return;
    //    }
    //});


    if (d3.select(this).classed("selected")) {
        remove_selected_list(d.name, d.depth, d.value);
        d3.select(this).classed("selected", function () { return !d3.select(this).classed("selected") });
        drawSelectedList();
        return;
    } else {
        d3.select(this).classed("selected", function () { return !d3.select(this).classed("selected") });
        if (append_selected_list(d)) return;
        drawSelectedList();
    }

    //selected_list.push(d)
    //selected_list.append(d);
    //console.log(d);
    //var percentage = (100 * d.value / totalSize).toPrecision(3);
    //var percentageString = percentage + "%";
    //if (percentage < 0.1) {
    //    percentageString = "< 0.1%";
    //}
    ////console.log(percentageString);
    //var _div = d3.select("#grid").append("div").classed("gridDiv", true);
    //_div.append("span").classed("gridAct", true).text("X").attr("data", d.name + ";" + d.depth + ";" + d.value).on("click", function () {
    //    remove_selected_list(d.name, d.depth, d.value);
    //    d3.select(this.parentNode).remove();
    //});
    //var sequenceArray = getAncestors(d);
    ////console.log(sequenceArray);
    //_div.append("span").text(percentageString + " : ").classed("gridSpan", true).style("width", "60px");
    //_div.append("span").text("Round " + d.depth).classed("gridSpan", true).style("width", "60px");
    //sequenceArray.forEach(function (d, i) {
    //    //console.log(sequenceArray.length + " : " + i);
    //    //var clr = colors[d.name];
    //    //console.log(clr);
    //    if (d.name == "end") {
    //        _div.append("span").text(d.name).classed("gridProd", true).style("background-color", function () { return "#999"; });
    //    }
    //    else {
    //        _div.append("span").text(d.name).classed("gridProd", true).style("background-color", function () { return "#" + colors[d.name]; });
    //        if ((sequenceArray.length - 1) != i) {
    //            _div.append("span").classed("gridSpan", true).text(" > ");
    //        }
    //    }
    //});
    //for (var i = 0; i< d.depth;i++){
    //    _div.append("span").text(d.parent.name);
    //}

}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width)
        .attr("height", 100)
        .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("svg:text")
      .attr("id", "endlabel")
      .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var g = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function (d) { return d.name + d.depth; });

    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");

    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function (d) { return colors[d.name]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.name; });

    // Set position for entering and updating nodes.
    g.attr("transform", function (d, i) {
        var __x = 0, __y = 0;
        var __i = Math.floor(i / 3);
        __x = (i % 3) * (b.w + b.s) + (__i * 35);
        __y = (__i * 32);
        //if (i < 3) {
        //    __x = i * (b.w + b.s);
        //} else {
        //    __x = (i - 3) * (b.w + b.s) + 30;
        //    __y = 30;
        //}
        return "translate(" + __x + ", " + __y + ")";
        //return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
    g.exit().remove();

    // Now move and update the percentage at the end.
    d3.select("#trail").select("#endlabel")
        .attr("x", (((nodeArray.length - 1) % 3) + 1.5) * (b.w + b.s) + (Math.floor((nodeArray.length - 1) / 3) * 35 - 80))
        .attr("y", (Math.floor((nodeArray.length - 1) / 3) * 32) + (b.h / 2))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
        .style("visibility", "");

}

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
}
function drawSeatRange() {
    d3.select("#seatList").on("click", function () {
        //console.log("click : " + d3.select("#ddlSeat").style("display"));
        d3.select("#ddlSeat").style("display", function () { return (d3.select("#ddlSeat").style("display") == "none" ? "" : "none"); });
    });
    showSeatList();

    var list_obj = d3.select("#ddlSeat").classed("ddl", true).style("display", "none");
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
function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 230, h: 30, s: 3, r: 3
    };

    var legend = d3.select("#legendList").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(colors).length * (li.h + li.s));

    var g = legend.selectAll("g")
        .data(d3.entries(colors))
        .enter().append("svg:g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * (li.h + li.s) + ")";
        });

    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function (d) { return d.value; });

    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.key; });

    d3.select("#togglelegend").on("click", toggleLegend);
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

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
    // filter data 
    var data_list = [];
    var _selectedSeat = []
    for (var i = 0; i < seat_range_list.length; i++) {
        if (seat_range_list[i].isShow) {
            _selectedSeat.push(seat_range_list[i].name)
        }
    }

    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i][0];
        var size = +csv[i][1];
        var region = csv[i][2];
        var seatRange = csv[i][3];
        if (selectedRegion == "All" || region == selectedRegion) {
            if (_selectedSeat.indexOf(seatRange) >= 0) {
                var _len = data_list.length;
                var _found = false;
                for (var j = 0; j < _len; j++) {
                    if (data_list[j].sequence == sequence) {
                        data_list[j].size += size;
                        _found = true;
                    }
                }
                if (!_found) {
                    data_list.push({
                        "sequence": sequence,
                        "size": size
                    });
                }
            }
        }
    }

    //console.log(data_list);

    var root = { "name": "root", "children": [] };
    //for (var i = 0; i < csv.length; i++) {
    //console.log(data_list.length);
    for (var i = 0; i < data_list.length; i++) {
        //console.log(data_list[i]);

        var sequence = data_list[i].sequence;
        var size = +data_list[i].size;
        //console.log(size);
        if (isNaN(size)) { // e.g. if this is a header row
            continue;
        }
        //var parts = sequence.split("-");
        var parts = sequence.split(";");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                //if (children != undefined) {
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = { "name": nodeName, "children": [] };
                    children.push(childNode);
                }
                //}
                currentNode = childNode;

            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = { "name": nodeName, "size": size };
                //if (children != undefined)
                children.push(childNode);
            }
        }
    }
    //console.log(root);
    return root;


};




function changeDisplayUnit(val) {
    //console.log(val);
    displayUnit = val;
    drawSelectedList();
}

function draw() {
    var json = buildHierarchy(csv);
    createVisualization(json);
}

drawRegion(region_list);
drawSeatRange()