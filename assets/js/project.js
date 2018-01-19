function init() {
    var svgContainer = d3.select("#canvas").append("svg:svg")
        .attr("width", 570)
        .attr("height", 800);
    //.attr("transform", "scale(0.7)");
    // title
    var svgTitle = svgContainer.append("svg")
        .attr("width", 250)
        .attr("height", 50)
        .attr("x", 200)
        .attr("y", 10);
    svgTitle.append("rect")
        .attr("width", 250)
        .attr("height", 50)
        .attr("x", 0)
        .attr("y", 0)
        .style("stroke", "#000")
        .style("stroke-width", "1px")
        .style("fill", "#fff");
    svgTitle.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("font-size", "16")
        .text("都會區整體運輸研究");
    var stage1 = AddStage(svgContainer, 0, 70, "企劃階段");
    AddTextBox(stage1, "機電設施規模研究", 20, 70);
    AddTextBox(stage1, "網路規劃", 300, 0, undefined, undefined, "active");
    AddTextBox(stage1, "走廊研究", 300, 70);
    AddTextBox(stage1, "路線可行性研究", 550, 10);
    AddTextBox(stage1, "聯合開發潛力及效益分析", 650, 70);

    var stage2 = AddStage(svgContainer, 0, 230, "規劃(含調查)階段");
    AddTextBox(stage2, "定線規劃", 480, 0);
    AddTextBox(stage2, "場站規劃", 480, 70);
    AddTextBox(stage2, "車輛系統", 30, 20, 100);
    AddTextBox(stage2, "號誌系統", 30, 80, 80);
    AddTextBox(stage2, "通訊系統", 120, 80, 80);
    AddTextBox(stage2, "自動收費", 200, 80, 80);
    AddTextBox(stage2, "供電系統", 30, 120);
    AddTextBox(stage2, "機電設備", 300, 80, 80);
    AddTextBox(stage2, "行控中心", 380, 80, 80);
    AddTextBox(stage2, "機電系統介面準則擬定", 120, 170);
    AddTextBox(stage2, "基地評選", 700, 120, 140);
    AddTextBox(stage2, "聯合開發方案", 850, 120, 140);
    AddTextBox(stage2, "禁限建公告", 600, 160);
    var stage3 = AddStage(svgContainer, 0, 460, "基本設計階段");
    var stage4 = AddStage(svgContainer, 0, 600, "細部設計階段");
    var stage5 = AddStage(svgContainer, 0, 750, "招標發包階段");
    var stage6 = AddStage(svgContainer, 0, 900, "施工,測試驗收階段");
    var stage7 = AddStage(svgContainer, 0, 1150, "營運階段");
}

function AddTextBox(_parent, text, x, y, w, h, classname) {
    if (w === undefined) w = 100;
    if (h === undefined) h = 30;
    var textbox = _parent.append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("x", x)
        .attr("y", y);
    if (classname === undefined) {
        textbox.append("rect")
            .attr("class", "box")
            .attr("width", w)
            .attr("height", h);
    } else {
        textbox.append("rect")
            .attr("class", "box")
            .attr("width", w)
            .attr("height", h)
            .attr("class", classname);
    }

    textbox.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("font-size", 12)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .text(text);
}

function AddStage(parentSVG, x, y, text) {
    var stage = parentSVG.append("g")
        .attr("transform", "translate(" + x + ", " + y + ")");
    stage.append("line")
        .attr("x1", 5)
        .attr("y1", 0)
        .attr("x2", 1195)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "5,1");
    stage.append("rect")
        .attr("class", "stage")
        .attr("width", "1190")
        .attr("height", 150)
        .attr("x", 5)
        .attr("y", 0)
    stage.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("class", "stage-title")
        .text(text);
    return stage.append("g")
        .attr("transform", "translate(20,20)");
    //return stage
}
window.onload = init();