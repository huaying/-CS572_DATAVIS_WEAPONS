var express = require('express');
var router = express.Router();
var http = require('http');

var httpGet = function (path,callback,data) {
    var body = ''
    var options = {
        host: 'localhost',
        port: 8983,
        path: path
    };
    //console.log(options.host+":"+options.port+options.path)
    http.get(options, function (res) {

        res.on('data', function (chunk) {
            body += chunk.toString('utf8')
        });
        res.on('end', function () {
            var jsonOriginal = JSON.parse(body)
            callback(jsonOriginal,data)
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}

var getQuery = function(q, year){
    var query = "*:*"
    if(q){
        query = q.replace(/\+/g," ")
    }
    if(year && ["2015","2014","2013","2012","2011","2010","2009"].indexOf(year) != -1){
        query += " AND seller-member-startDate:["+year+"-01-01T00:00:00Z TO "+(parseInt(year)+1)+"-01-01T00:00:00Z]"
    }
    
    //return query
    return encodeURIComponent(query)
}

var d3pie = function (callback,query,year) {
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-manufacturer'
    console.log(path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-manufacturer"]

            var loop_num = Math.min(jsonOriginal.length, 20)
            for (var i = 0; i < loop_num; i += 2) {
                if ( jsonOriginal[i + 1] != 0 ){
                    jsonRlt.push({
                        "lang": jsonOriginal[i],
                        "count": jsonOriginal[i + 1]
                    })
                }
            }
            callback(jsonRlt)
    })
}

var d3BubbleChart = function (callback,query,year) {

    var jsonRlt = {}
    var arr = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
    console.log(path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-keywords"]

        var loop_num = jsonOriginal.length
        for (var i = 0; i < loop_num; i += 2) {
            arr.push({
                "name": jsonOriginal[i],
                "size": jsonOriginal[i + 1]
            })
        }
        jsonRlt = {
            "name": "keyword",
            "children": arr
        }
        callback(jsonRlt)
    })
}

var d3cloud = function (callback,query,year) {

    var jsonRlt = []
    var path = '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
    //var path = '/solr/gettingstarted_shard1_replica2/select?q=&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
    console.log(path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-keywords"]

        var loop_num = Math.min(jsonOriginal.length, 20000)
        var size_arr = []
        for (var i = 0; i < loop_num; i += 2) {
            jsonRlt.push({
                "text": jsonOriginal[i],
                "size": jsonOriginal[i + 1]
            })
            size_arr.push(jsonOriginal[i + 1])
        }
        var size_max = size_arr.reduce(function(a,b){return ( a > b ? a : b )})
        jsonRlt = jsonRlt.map(function(obj){
            obj.size = obj.size/size_max * 100
            return obj
        })
        callback(jsonRlt)
    })
}

var d3RingTree = function (callback,query,year) {

    var jsonRlt = []
    var path = '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-manufacturer'
    console.log(path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-manufacturer"]

        var loop_num = Math.min(jsonOriginal.length, 20)
        var title_current = 0
        for (var i = 0; i < loop_num; i += 2) {
            var manufacturer = jsonOriginal[i]
            var path = '/solr/gettingstarted_shard1_replica2/select?q=itemOffered-manufacturer%3A'+encodeURIComponent (manufacturer)+'&rows=10&fl=title&wt=json&indent=true'
            
            
           httpGet(path,function(jsonOriginal,manufacturer){
               var children = []
                jsonOriginal = jsonOriginal.response.docs
                jsonOriginal.forEach(function(obj, index, ar){
                    children.push({"name": obj.title[0]})
                })
                jsonRlt.push({"name":manufacturer, "children": children })
                title_current++
                if (title_current == loop_num/2){
                    jsonRlt = {"name": "weapon", "children": jsonRlt}
                    callback(jsonRlt)
                }
           },manufacturer)
        }
    })
}


var d3BarChart = function (callback,query,year) {
    
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&rows=10&wt=json&indent=true&facet=true&facet.field=tika_location-name'
    console.log(path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["tika_location-name"]

            var loop_num = Math.min(jsonOriginal.length ,30)
            var count_arr = []
            for (var i = 0; i < loop_num; i += 2) {
                jsonRlt.push({
                    "name": jsonOriginal[i],
                    "count": jsonOriginal[i + 1]
                })
                count_arr.push(jsonOriginal[i + 1])
            }
            var count_sum = count_arr.reduce(function(a,b){return a+b})
            jsonRlt = jsonRlt.map(function(obj){
                obj.count = obj.count/count_sum
                return obj
            })
            callback(jsonRlt)
    })
}


var d3Map = function (callback,query,year) {
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query,year)+'&fl=fallsWithinCountry-geo-lon%2CfallsWithinCountry-geo-lat&wt=json&indent=true&rows=40000'
    console.log("map:"+path)
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.response.docs

            var loop_num = jsonOriginal.length
            for (var i = 0; i < loop_num; i ++) {
                if(jsonOriginal[i]["fallsWithinCountry-geo-lat"] && 
                   jsonOriginal[i]["fallsWithinCountry-geo-lon"]){
                jsonRlt.push([
                    jsonOriginal[i]["fallsWithinCountry-geo-lon"][0],
                    jsonOriginal[i]["fallsWithinCountry-geo-lat"][0]
                ])
                }
            }
            callback(jsonRlt)
    })
}

router.get('/d3pie', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3pie(function (jsonRlt) {
        res.json(jsonRlt)
    },query,year)
})

router.get('/d3BubbleChart', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3BubbleChart(function (jsonRlt) {
        res.json(jsonRlt)
    },query,year)
})

router.get('/d3cloud', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3cloud(function (jsonRlt) {
        console.log(jsonRlt)
        res.json(jsonRlt)
    },query,year)
})

router.get('/d3RingTree', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3RingTree(function (jsonRlt) {
        res.json(jsonRlt)
    },query,year)
})

router.get('/d3BarChart', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3BarChart(function (jsonRlt) {
        res.json(jsonRlt)
    },query,year)
})

router.get('/d3Map', function (req, res, next) {
    query = req.query.q
    year = req.query.year
    d3Map(function (jsonRlt) {
        res.json(jsonRlt)
    },query,year)
})

module.exports = router;