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

var getQuery = function(query){
    if(!query){
        return "*%3A*"
    }
    return encodeURIComponent(query)
}

var d3pie = function (callback,query) {
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-manufacturer'
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-manufacturer"]

            var loop_num = Math.min(jsonOriginal.length, 20)
            for (var i = 0; i < loop_num; i += 2) {
                jsonRlt.push({
                    "lang": jsonOriginal[i] + ":  " + jsonOriginal[i + 1],
                    "count": jsonOriginal[i + 1]
                })
            }
            callback(jsonRlt)
    })
}

var d3BubbleChart = function (callback,query) {

    var jsonRlt = {}
    var arr = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
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

var d3cloud = function (callback,query) {

    var jsonRlt = []
    var path = '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
    //var path = '/solr/gettingstarted_shard1_replica2/select?q=&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-keywords'
    httpGet(path, function(jsonOriginal){
        jsonOriginal = jsonOriginal.facet_counts.facet_fields["itemOffered-keywords"]

        var loop_num = Math.min(jsonOriginal.length, 20000)
        for (var i = 0; i < loop_num; i += 2) {
            jsonRlt.push({
                "text": jsonOriginal[i],
                "size": Math.sqrt(jsonOriginal[i + 1])
            })
        }
        callback(jsonRlt)
    })
}

var d3RingTree = function (callback,query) {

    var jsonRlt = []
    var path = '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&rows=0&wt=json&indent=true&facet=true&facet.field=itemOffered-manufacturer'
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


var d3BarChart = function (callback,query) {
    
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&rows=10&wt=json&indent=true&facet=true&facet.field=tika_location-name'
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


var d3Map = function (callback,query) {
    var jsonRlt = []
    var path =  '/solr/gettingstarted_shard1_replica2/select?q='+getQuery(query)+'&fl=fallsWithinCountry-geo-lon%2CfallsWithinCountry-geo-lat&wt=json&indent=true&rows=20000'
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
    d3pie(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

router.get('/d3BubbleChart', function (req, res, next) {
    query = req.query.q
    d3BubbleChart(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

router.get('/d3cloud', function (req, res, next) {
    query = req.query.q
    d3cloud(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

router.get('/d3RingTree', function (req, res, next) {
    query = req.query.q
    d3RingTree(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

router.get('/d3BarChart', function (req, res, next) {
    query = req.query.q
    d3BarChart(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

router.get('/d3Map', function (req, res, next) {
    query = req.query.q
    d3Map(function (jsonRlt) {
        res.json(jsonRlt)
    },query)
})

module.exports = router;