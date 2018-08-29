var express = require('express')
var path = require('path')
var router = express.Router()
var searchResults = require('../public/javascripts/index.js')
var fetch = require('node-fetch')
var fs = require('fs')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index')
})

router.get('/charts', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'charts.html'))
})

module.exports = router
