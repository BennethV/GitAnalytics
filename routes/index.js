var express = require('express')
var path = require('path')
var router = express.Router()
var searchResults = require('../public/javascripts/index.js')
var fetch = require('node-fetch')
var fs = require('fs')
/* GET home page. */
router.get('/', function (req, res, next) {
  var reset = {
    'accessToken': '',
    'username': '',
    'organisation': '',
    'repository': ''
  }
  fs.writeFile(__dirname + '\\..\\public\\javascripts\\data.json', JSON.stringify(reset), function (err) {
    if (err) throw err
    console.log(err)
  })
  res.render('index')
})

router.get('/charts', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'charts.html'))
})

module.exports = router
