(function () {
    var query = getUrlParameter('q')
    var year = getUrlParameter('year')
    var jsonPath = "/solrJson/d3cloud"
    jsonPath += "?" + $.param({
        "q": query,
        "year": year
    })

    d3.json(jsonPath, function (error, data) {
        $("#cloud").append(" <div>Documents v.s Important Keywords</div>")
        var color = d3.scale.category20c()
//            .domain([0, 0.005, 0.01, 0.2, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.15, 0.25, 0.4, 0.5, 0.7, 0.8, 0.9, 1])
//            .range(["#1f77b4", "#aec7e8", "#ff7f0e ", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]);
        d3.layout.cloud().size([800, 400])
            .words(data)
            .rotate(5)
            .fontSize(function (d) {
                return d.size;
            })
            .on("end", draw)
            .start();
        function draw(words) {
            d3.select("#cloud").append("svg")
                .attr("width", 800)
                .attr("height", 400)
                .attr("class", "wordcloud")
                .append("g")
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
                .attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("fill", function (d, i) {
                    return color(i);
                })
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.text;
                });
        }
    })


})()