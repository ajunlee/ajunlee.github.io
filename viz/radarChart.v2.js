/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

function RadarChart(id, data, options) {
    var cfg = {
        w: 600,				//Width of the circle
        h: 600,				//Height of the circle
        margin: { top: 50, right: 50, bottom: 50, left: 50 }, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scale.category10()
    };

    //Put all of the options into a variable called cfg
    if ('undefined' !== typeof options) {
        for (var i in options) {
            if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
        }//for i
    }//if

    var _dateIndex = _maxDateIndex = data.length - 1;
    //console.log(_dateIndex);
    //console.log(_maxDateIndex);

    var tooltip = d3.select("#main").append("div").attr("class", "tooltip").style("opacity", 0);

    var region_list = [
    { "Region": "Global", "Color": "#7AF67A", "IsHidden": false },
    { "Region": "AMEA", "Color": "#FFC81E", "IsHidden": false },
    { "Region": "Americas", "Color": "#FF0000", "IsHidden": false },
    { "Region": "Europe", "Color": "#A30FE2", "IsHidden": false },
    { "Region": "JP", "Color": "#50D6FF", "IsHidden": false }
    ];
    function regionColor(regionName) {
        var result = "#ccc";
        region_list.forEach(function (d) {
            if (d.Region == regionName) {
                result = d.Color;
            }
        });
        return result;
    }
    function isHidden(regionName) {
        var cssName = "";
        region_list.forEach(function (d) {
            if (d.Region == regionName && d.IsHidden) {
                cssName = "hidden";
            }
        });
        return cssName;
    }
    function getRegion(regionName) {
        var result = undefined;
        region_list.forEach(function (d) {
            if (d.Region == regionName) {
                result = d;
            }
        });
        return result;
    }
    function drawRegion(dateIndex) {
        d3.select("#regionList").html("");
        region_list.forEach(function (d, i) {
            var lbl = d3.select("#regionList").append("label");
            lbl.append("input").attr("type", "checkbox").attr("checked", function () { return (d.IsHidden ? "" : "checked"); }).attr("value", function () { return returnNULL(d.Region); });
            //lbl.append("span").text(function () { return returnNULL(d.Region); }).style("background-color", cfg.color(i));
            lbl.append("span").text(function () { return returnNULL(d.Region); })
                .style("background-color", function () {
                    var c = d3.rgb(d.Color);
                    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + cfg.opacityArea + ")";
                })
                .style("border","solid 2px " + d.Color);

            //d3.select("#regionList").append("br");

            d3.selectAll("#regionList input[type=checkbox]").on("click", function () {
                // console.log("got");
                // console.log(this);
                //console.log(d3.select(this).attr("value"));
                var _region = getRegion(d3.select(this).attr("value"));
                if (_region != undefined) {
                    _region.IsHidden = !_region.IsHidden;
                }
                
                //dd.IsHidden = !dd.IsHidden;
                toggleRegion(d3.select(this).attr("value"));

                //console.log(region_list);
            });
        });
        //data[dateIndex].Data.forEach(function (d, i) {
        //    //console.log(d);
        //    var lbl = d3.select("#regionList").append("label");
        //    lbl.append("input").attr("type", "checkbox").attr("checked", "checked").attr("value", function () { return returnNULL(d.region); });
        //    lbl.append("span").text(function () { return returnNULL(d.region); }).style("background-color", cfg.color(i));

        //    //d3.select("#regionList").append("br");

        //    d3.selectAll("#regionList input[type=checkbox]").on("click", function (d, i) {
        //        // console.log(i);
        //        // console.log("got");
        //        // console.log(this);
        //        //console.log(d3.select(this).attr("value"));
        //        toggleRegion(d3.select(this).attr("value"));
        //    });
        //});
    }

    function toggleRegion(region) {
        //console.log(region);
        var p = d3.selectAll("g." + region),
	    //console.log(p);
        c = p.classed("hidden"),
        n = c ^ true;

        p.classed("hidden", n);
    }

    function returnNULL(val) { return (val == null ? "NULL" : val); }
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) {
        //console.log(i.axises);
        return d3.max(i.Data[0].axes.map(function (o) { return o.value; }))
    }));

    var allAxis = (data[_dateIndex].Data[0].axes.map(function (i, j) { return i.axis })),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w / 2, cfg.h / 2), 	//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

    //Scale for the radius
    var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();

    //Initiate the radar chart SVG
    var svg = d3.select(id).append("svg")
			.attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar" + id);
    //Append a g element		
    var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    var filter = g.append('defs').append('filter').attr('id', 'glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

    function drawAxis() {
        d3.select(id).select("g.axisWrapper").remove();

        //Wrapper for the grid & axes
        var axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
           .data(d3.range(1, (cfg.levels + 1)).reverse())
           .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) { return radius / cfg.levels * d; })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
           .data(d3.range(1, (cfg.levels + 1)).reverse())
           .enter().append("text")
           .attr("class", "axisLabel")
           .attr("x", 4)
           .attr("y", function (d) { return -d * radius / cfg.levels; })
           .attr("dy", "0.4em")
           .style("font-size", "10px")
           .attr("fill", "#737373")
           .text(function (d, i) { return Format(maxValue * d / cfg.levels); });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("y2", function (d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("y", function (d, i) {
                //console.log(" ==== = ");
                //console.log(maxValue);
                //console.log(cfg.labelFactor);
                //console.log(angleSlice);
                //console.log(i);
                //console.log(Math.PI);
                //console.log(rScale(maxValue * cfg.labelFactor));
                //console.log(Math.sin(angleSlice * i - Math.PI / 2));
                //console.log(rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2) + 30);
                return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2) - 40;
            })
            .text(function (d) { return d })
            .call(wrap, cfg.wrapWidth);
    }
    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function (d) { return rScale(d.value); })
		.angle(function (d, i) { return i * angleSlice; });

    if (cfg.roundStrokes) {
        radarLine.interpolate("cardinal-closed");
    }

    function drawWrapper(dateIndex) {
        d3.select(id).selectAll("g.radarWrapper").remove();
        //Create a wrapper for the blobs
        var g = d3.select(id).select("svg > g");
        //console.log(" > dateIndex : " + dateIndex);
        //console.log(data[dateIndex])
        var blobWrapper = g.selectAll(".radarWrapper")
            .data(data[dateIndex].Data)
            .enter().append("g")
            .attr("class", function (d) { return "radarWrapper " + returnNULL(d.region) + " " + isHidden(d.region)});
        //console.log(blobWrapper);
        //console.log(blobWrapper);
        //Append the backgrounds	
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function (d, i) {
                //console.log(d);
                return radarLine(d.axes);
            })
            //.style("fill", function (d, i) { return cfg.color(i); })
            .style("fill", function (d, i) { return regionColor(d.region); })
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function (d, i) {
                //Dim all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
                //console.log(d);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                console.log(d);
                var _html = d.region + " : <br />";
                for (var i = 0; i < d.axes.length; i++) {
                    _html += d.axes[i].axis + " : " + Format(d.axes[i].value) + "<br />";
                }
               
                tooltip.html(_html)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function () {
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
                tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            });

        //Create the outlines	
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function (d, i) {
                //console.log(d.axises[dateIndex].axes);
                //console.log(d);
                return radarLine(d.axes);
            })
            .style("stroke-width", cfg.strokeWidth + "px")
            //.style("stroke", function (d, i) { return cfg.color(i); })
            .style("stroke", function (d, i) { return regionColor(d.region); })
            .style("fill", "none")
            .style("filter", "url(#glow)");

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(function (d, i) {
                //console.log(d);
                return d.axes;
            })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
            //.style("fill", function (d, i, j) { return cfg.color(j); })
            .style("fill", function (d, i, j) { return regionColor(d.region); })
            .style("fill-opacity", 0.8);
    }
    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    function drawCircleWrapper(dateIndex) {
        //console.log(id);
        d3.select(id).selectAll("g.radarCircleWrapper").remove();
        //Wrapper for the invisible circles on top
        var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data[dateIndex].Data)
            .enter().append("g")
            .attr("class", function (d) { return "radarCircleWrapper " + d.region; });

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function (d, i) { return d.axes; })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
            .style("fill", "none")
            .style("pointer-events", "all");
            //.on("mouseover", function (d, i) {
            //    newX = parseFloat(d3.select(this).attr('cx')) - 10;
            //    newY = parseFloat(d3.select(this).attr('cy')) - 10;

            //    tooltip
            //        .attr('x', newX)
            //        .attr('y', newY)
            //        .text(Format(d.value))
            //        .transition().duration(200)
            //        .style('opacity', 1);
            //})
            //.on("mouseout", function () {
            //    tooltip.transition().duration(200)
            //        .style("opacity", 0);
            //});
    }


    //Set up the small tooltip for when you hover over a circle
    //var tooltip = g.append("text")
	//	.attr("class", "tooltip")
	//	.style("opacity", 0);

    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text	
    //var _play_state = 0;

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap	

    function changeTimeFrame(newDateIndex) {
        if (newDateIndex == _dateIndex) return;
        _dateIndex = newDateIndex;
        if (newDateIndex > _maxDateIndex) {
            _dateIndex = _maxDateIndex;
        } else if (newDateIndex < 0) {
            _dateIndex = 0;
        }
        allAxis = (data[_dateIndex].Data[0].axes.map(function (i, j) { return i.axis })),	//Names of each axis
        total = allAxis.length,					//The number of different axes
        angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
        //drawAxis();
        //drawRegion(newDate);
        drawWrapper(_dateIndex);
        //drawCircleWrapper(newDate);
    }

    function drawTimeSlider(minDate, maxDate, callback) {
        var _minDate = new Date(minDate), _maxDate = new Date(maxDate);
        var curDate = _maxDate;
        var _isPlaying = false;
        var _interval = 1;
        var playAct;

        var svg = d3.select("svg#timeSlider"),
        margin = { right: 30, left: 30 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height");

        var months = monthDiff(_minDate, _maxDate);
        //console.log(_minDate);
        //console.log(_maxDate);
        //console.log(months);
        var _curVal = months + 1;
        var x = d3.scale.linear()
            .domain([0, _curVal])
            .range([0, width])
            .clamp(true);

        var slider = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + 10 + ")");
        //.attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
        //var _startDate = new Date(minDate);

        slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
          .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
          .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.behavior.drag()
                //.on("start.interrupt", function () { slider.interrupt(); })
                .on("dragstart", function () {
                    //console.log("start " + x.invert(d3.mouse(this)[0]));
                    updateValue(x.invert(d3.mouse(this)[0]));
                    //slider.interrupt();
                })
                .on("drag", function () {
                    //slider.interrupt();
                    //console.log("drag " + d3.event.x);
                    updateValue(x.invert(d3.event.x));
                    //hue(x.invert(d3.event.x));
                    if ((callback != undefined) && (typeof callback == "function")) callback(_curVal);
                })
                .on("dragend", function () {
                    //console.log(Math.round(x.invert(d3.event.x)));
                    //console.log(_curVal);
                    if ((callback != undefined) && (typeof callback == "function")) {
                        callback(_curVal);
                    }
                }));

        var _startMonth = _minDate.getMonth();
        //console.log("Start Month : " + _startMonth);

        var timeticks = slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
          .selectAll("text")
          .data(x.ticks(months + 1))
            .enter();
        timeticks.append("text")
        .attr("x", x)
        .attr("y", function (d, i) {
            if ((_startMonth == 0 && (d % 12) == 0) || (d % 12) == (12 - _startMonth)) {
                return 10;
            } else {
                return 0;
            }
            //var dt = addMonths(_minDate, d);
            //console.log("m : " + dt.getMonth() + " : " + (d % 12) + " : " + _startMonth);
            //if (dt.getMonth() == 1) {
            //    return 0;
            //}
            //else {
            //    return -5;
            //}
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            var dt = addMonths(_minDate, d);
            //if (dt.getMonth() == 1) {

            if ((_startMonth == 0 && (d % 12) == 0) || (d % 12) == (12 - _startMonth)) {
                return formatDate(dt);
            }
            else {
                return formatDate(dt, "m");
            }

        });
        timeticks.append("line")
        .attr("x1", x).attr("y1", -25)
        .attr("x2", x).attr("y2", function (d) { return (((_startMonth == 0 && (d % 12) == 0) || (d % 12) == (12 - _startMonth)) ? "-2" : "-10"); })
        .attr("class", function (d, i) {
            return ((_startMonth == 0 && (d % 12) == 0) || (d % 12) == (12 - _startMonth)) ? "tickdot" : "tickline";
        });

        var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 5);

        slider.transition() // Gratuitous intro!
            .duration(750)
            .tween("hue", function () {
                //var i = d3.interpolate(0, 70);
                //console.log(i);
                return function (t) {
                    //console.log(t);
                    updateValue(_curVal);
                    //updateValue(t);
                    //  hue(i(t));
                };
            });

        updateDate(_maxDate);


        document.getElementById("btnPlay").addEventListener("click", function () {
            if (_isPlaying) {
                //console.log("stop");
                window.clearInterval(playAct);
                _isPlaying = false;
                d3.select("#btnPlay>i").classed("fa-play",true).classed("fa-pause",false);
            } else {
                //console.log("play");
                _isPlaying = true;
                if (_curVal == _maxDateIndex) _curVal = 0;
                //_dateIndex = 0;
                //document.getElementById("rangeControlledByDate").value = _dateIndex;
                //updateValue(_dateIndex);
                //if (callback && (typeof callback === "function")) callback(_dateIndex);
                //updateTimeFrame(_dateIndex);
                d3.select("#btnPlay>i").classed("fa-play", false).classed("fa-pause", true);
                playAct = window.setInterval(function () {
                    //console.log("playing");
                    //console.log("curval : " + _curVal);
                    _curVal++;
                    //document.getElementById("rangeControlledByDate").value = _dateIndex;
                    //updateTimeFrame(_dateIndex);
                    //console.log(_dateIndex);
                    if (_curVal > _maxDateIndex) {
                        _curVal = _maxDateIndex;
                        window.clearInterval(playAct);
                        _isPlaying = false;
                        d3.select("#btnPlay>i").classed("fa-play", true).classed("fa-pause", false);
                    } else {
                        updateValue(_curVal);
                        //console.log("curval : " + _curVal);
                        if (callback && (typeof callback === "function")) callback(_curVal);
                    }
                }, (_interval * 1000));
            }
        });

        function updateDate(date) {
            curDate = date;
            var _months = monthDiff(_minDate, curDate);
            hue(_months);
        }
        function updateValue(data) {
            var val = Math.round(data);
            _curVal = val;
            //console.log("val" + val);
            hue(val);
            //handle.attr("cx", x(val));
            //var newDate = addMonths(_minDate, val);
            //d3.select("#divInfo").text(newDate);
            curDate = addMonths(_minDate, val);
            //d3.select("#divInfo").text(formatDate(curDate));
            d3.select("#divDate > .year").text(curDate.getFullYear());
            d3.select("#divDate > .month").text(pad(curDate.getMonth() + 1, 2));
        }
        function hue(h) {
            //console.log(h);
            handle.attr("cx", x(h));
            //svg.style("background-color", d3.hsl(h, 0.8, 0.8));
        }
        function addMonths(curDate, monthInterval) {
            var result = new Date(_minDate);
            //console.log(result);
            return new Date(result.setMonth(result.getMonth() + monthInterval));
        }
        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
        function formatDate(curDate, ft) {
            var result;
            if (ft == undefined) {
                result = curDate.getFullYear() + "-";
            } else if (ft == "m") {
                result = "";
            } else {
                result = "'" + curDate.getFullYear().toString().substring(2, 4) + "-";
            }
            var month = (curDate.getMonth() + 1);
            result += (month < 10 ? "0" + month : month);
            return result;
            //return curDate.getFullYear() + "-" + curDate.getMonth();// + "-" + date.getDate();
        }
        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
    }

    //drawTimeFrame();
    drawTimeSlider(data[0].FileMonth, data[data.length - 1].FileMonth, changeTimeFrame);
    drawRegion(_dateIndex);
    drawAxis();
    drawWrapper(_dateIndex);
    drawCircleWrapper(_dateIndex);
}//RadarChart