(function () {
    
    var query = getUrlParameter('q')
    var jsonPath = "/solrJson/d3Map"
    if (query){
        jsonPath += "?q=" + encodeURIComponent(query)
    }
        
    var width = 800,
        height = 400;

    // set projection
    var projection = d3.geo.mercator();

    // create path variable
    var path = d3.geo.path()
        .projection(projection);


    d3.json("us.json", function (error, topo) {
        d3.json(jsonPath, function (error, data) {
            //console.log(data)
            states = topojson.feature(topo, topo.objects.states).features

            // set projection parameters
            projection
                .scale(700)
                .center([-90, 35])

            // create svg variable
            var svg = d3.select("#map").append("svg")
                .attr("width", width)
                .attr("height", height);

            // points
            //aa = [-97.51643, 35.46756];
            //bb = [-122.389809, 37.72728];

            // add states from topojson
            svg.selectAll("path")
                .data(states).enter()
                .append("path")
                .attr("class", "feature")
                //.style("fill", "#cce5ff")
                .attr("d", path);

            // put boarder around states 
            svg.append("path")
                .datum(topojson.mesh(topo, topo.objects.states, function (a, b) {
                    return a !== b;
                }))
                .attr("class", "mesh")
                .attr("d", path);

            // add circles to svg
            svg.selectAll("circle")
                .data(data).enter()
                .append("circle")
                .attr("cx", function (d) {
                    //console.log(projection(d));
                    return projection(d)[0];
                })
                .attr("cy", function (d) {
                    return projection(d)[1];
                })
                .attr("r", "2px")
                .attr("fill", "#888")

        })
    });




})()