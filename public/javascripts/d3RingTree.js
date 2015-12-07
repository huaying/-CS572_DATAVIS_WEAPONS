(function(){

// var root = {
// "name": "flare",
// "children": [
//     {"name":"d11ddd",
//     "children": [
//      {"name": "ArrayInterpolator", "size": 1983},
//      {"name": "ColorInterpolator", "size": 2047},
//      {"name": "DateInterpolator", "size": 1375},
//      {"name": "Interpolator", "size": 8746},
//      {"name": "MatrixInterpolator", "size": 2202},
//      {"name": "NumberInterpolator", "size": 1382},
//      {"name": "ObjectInterpolator", "size": 1629},
//      {"name": "PointInterpolator", "size": 1675},
//    {"name": "DataField", "size": 1759},
//    {"name": "DataSchema", "size": 2165},
//    {"name": "DataSet", "size": 586},
//    {"name": "DataSource", "size": 3331},
//    {"name": "DataTable", "size": 772},
//    {"name": "DataUtil", "size": 3322}
//         ]
//     },
//{"name":"daaaddd",
//     "children": [
//      {"name": "ArrayInterpolator", "size": 1983},
//      {"name": "ColorInterpolator", "size": 2047},
//      {"name": "DateInterpolator", "size": 1375},
//      {"name": "Interpolator", "size": 8746},
//      {"name": "MatrixInterpolator", "size": 2202},
//      {"name": "NumberInterpolator", "size": 1382},
//      {"name": "ObjectInterpolator", "size": 1629},
//      {"name": "PointInterpolator", "size": 1675},
//    {"name": "DataField", "size": 1759},
//    {"name": "DataSchema", "size": 2165},
//    {"name": "DataSet", "size": 586},
//    {"name": "DataSource", "size": 3331},
//    {"name": "DataTable", "size": 772},
//    {"name": "DataUtil", "size": 3322}
//         ]
//     },
//     {"name":"ddddss",
//     "children": [
//      {"name": "ArrayInterpolator", "size": 1983},
//      {"name": "ColorInterpolator", "size": 2047},
//      {"name": "DateInterpolator", "size": 1375},
//      {"name": "Interpolator", "size": 8746},
//      {"name": "MatrixInterpolator", "size": 2202},
//      {"name": "NumberInterpolator", "size": 1382},
//      {"name": "ObjectInterpolator", "size": 1629},
//      {"name": "PointInterpolator", "size": 1675},
//    {"name": "DataField", "size": 1759},
//    {"name": "DataSchema", "size": 2165},
//    {"name": "DataSet", "size": 586},
//    {"name": "DataSource", "size": 3331},
//    {"name": "DataTable", "size": 772},
//    {"name": "DataUtil", "size": 3322}
//         ]
//     }]
//}   
    var query = getUrlParameter('q')
    var year = getUrlParameter('year')
    var jsonPath = "/solrJson/d3RingTree"
    jsonPath += "?"+ $.param({"q":query,"year":year}) 
        

var diameter = 800;

var tree = d3.layout.tree()
    .size([360, diameter / 2 - 180])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

$("#ringtree").append(" <div>Weapon Maufacturers v.s Their Documents(Weapons)</div>")
var svg = d3.select("#ringtree").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json(jsonPath, function(error, root) {
  if (error) throw error;

  
  
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; 
                                      
                                     })

  node.append("circle")
      .attr("r", 4.5);

  node.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
      .text(function(d) { return d.name; });
});
})()