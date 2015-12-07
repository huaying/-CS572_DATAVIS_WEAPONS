var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var query = "", year="";
  if (req.query.q) query = req.query.q
  if (req.query.year) year = req.query.year
  res.render('index', { query: query, year: year});
});

module.exports = router;
