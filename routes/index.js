var express = require('express')
var path = require('path')
var router = express.Router()
var searchResults = require('../public/javascripts/index.js')
var fetch = require('node-fetch')
const clientId = 'Iv1.2688b3ba9cc65693'
const clientSecret = 'ae76b7451684b64bda069a9a6c39bd9cd2310368'

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index')
})

router.get('/charts', function (req, res, next) {
  res.sendFile(path.join(__dirname,'../views','charts.html'))
})

router.get('/repolists/:id', function (req, res, next) {
  console.log(searchResults.userDetails().userRepos[req.params.id])
  res.render('repository', { title: searchResults.userDetails().userRepos[req.params.id] })
})

router.post('/', function (req, res, next) {
//  console.log('Before' + searchResults.userFound() );
  searchResults.userDetails().userRepos.length = 0;

  (async function () {
    var user = req.body.username
    try {
      const result = await fetch(`https://api.github.com/users/${user}?client_id=${clientId}&client_secret=${clientSecret}`)
      const data = await result.json()
      searchResults.searchUsername(data)

      if (data.message !== 'Not Found') {
        await fetch(data.repos_url)
          .then(function (res) {
            return res.json()
          }).then(function (data) {
            // storing the repos into an array
            for (var i = 0; i < data.length; i++) {
              searchResults.userDetails().userRepos[i] = data[i].name
            }
          })
      }

      res.render('index', { userDetails: searchResults.userDetails() })

      // return {data}
    } catch (err) { console.log(err) }
  })()
})
module.exports = router
