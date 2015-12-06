(function(){
    
// d3 actionsssss		
//var data=[{"lang":"mip","count":24},{"lang":"theft","count":558},{"lang":"drugs","count":81},{"lang":"arson","count":3},{"lang":"assault","count":80},{"lang":"burglary","count":49},{"lang":"disorderlyConduct","count":63},{"lang":"mischief","count":189},{"lang":"dui","count":107},{"lang":"resistingArrest","count":11},{"lang":"sexCrimes","count":24},{"lang":"other","count":58}];

var query = getUrlParameter('q')
var jsonPath = "/solrJson/d3pie"
    if (query){
        jsonPath += "?q=" + encodeURIComponent(query)
    }    
    
var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00","#ccffe6","#66ccff","#cc99ff","#ecffb3","#ff8080","#99b3ff","#ddff99","#b3b3cc","#ecc6d9","#99e6ff","#a3c2c2","#e5fff2"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
    return d.count;
});

d3.json(jsonPath, function(error, data) {
    if (error) throw error
    
    var svg = d3.select("#pie").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
        return color(d.data.lang);
    });

    g.append("text")
        .attr("transform", function (d) {
        return "translate(" + arc.centroid(d) + ")";
    })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function (d) {
        return d.data.lang;
    });
})

})()
