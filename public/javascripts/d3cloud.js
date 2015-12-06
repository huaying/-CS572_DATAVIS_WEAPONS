(function(){
var query = getUrlParameter('q')
var jsonPath = "/solrJson/d3cloud"
    if (query){
        jsonPath += "?q=" + encodeURIComponent(query)
    }
    
d3.json(jsonPath, function(error, data) {
    
var color = d3.scale.linear()
            .domain([0,1,2,5,7,10,13,17,22,30,40,55,75,80,100,120,135,150,180,200])
            .range(["#1f77b4", "#aec7e8", "#ff7f0e ", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7", "#bcbd22","#dbdb8d","#17becf","#9edae5"]);
    d3.layout.cloud().size([800, 400])
            .words(data)
            .rotate(5)
            .fontSize(function(d) { return d.size*0.7; })
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
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
    }
})


})()