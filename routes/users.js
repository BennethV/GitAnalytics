// required headers for access token
var express = require('express')
var router = express.Router()
const request = require('superagent')
require('superagent-proxy')(request)
var fetch = require('node-fetch')
var clientId = ''
var clientSecret = ''
var accessToken = ''
var orgNames = []
var orgs = {}
var repoList = []
var daysElapsed = []
var createDate = ''
var fs = require('fs')
var proxy = process.env.http_proxy || 'http://students%5C1077310:18Barnato@1051@proxyss.wits.ac.za:80'

/* GET users listing. */

router.get('/', function (req, res, next) {
  const {query} = req
  const {code} = query;
  // we need this because we are making an outgoing reques to another server

  (async function () {
    try {
      await request
        .post('https://github.com/login/oauth/access_token')
        .send({ client_id: clientId,
          client_secret: clientSecret,
          code: code }) // sends a JSON post body
        .proxy(proxy)
        .set('accept', 'application/json')
        .then(async function (result) {
          const data = result.body
          accessToken = data.access_token
          fs.writeFile(__dirname + '\\..\\public\\javascripts\\code.txt', accessToken, function (err) {
            if (err) throw err
            console.log(err)
          })
          // from here we can then add the URLs for statistics using our synchronous functions.
          // This gets information about the user

          await request
            .get('https://api.github.com/user')
            .proxy(proxy)
            .set('Authorization', 'token ' + accessToken)
            .set('accept', 'application/json')
            .then(async function (results) {
              // Gets list of organizations that the user has
              await request
                .get(results.body.organizations_url)
                .proxy(proxy)
                .set('Authorization', 'token ' + accessToken)
                .set('accept', 'application/json')
                .then(function (organizations) {
                  orgs = organizations.body // a for lop for putiting the organizaions into an array
                  for (var i = 0; i < orgs.length; i++) {
                    orgNames[i] = orgs[i].login
                  }
                })
            })
          res.render('index', {orgNames: orgNames})
        })
    } catch (err) { console.log(err) }
  })()
})

router.get('/orgDetails/:id', function (req, res, next) {
  const currentOrg = orgs[req.params.id]
  const repoUrl = currentOrg.repos_url
  var repoNames = [];
  (async function () {
    await request
      .get(repoUrl)
      .proxy(proxy)
      .set('Authorization', 'token ' + accessToken)
      .set('accept', 'application/json')
      .then(function (repos) {
        repoList = repos.body
        for (var i = 0; i < repoList.length; i++) {
          repoNames[i] = repoList[i].name
        }
      })
    await res.render('index', {repoNames: repoNames})
  })()
})
router.post('/authorise', function (req, res, next) {
  clientId = req.body.clientId
  clientSecret = req.body.clientSecret
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`)
})

// getting details of the selected repo. These will be passed so
// that they will be rendered on the client side.

// this code will need to be cleaned. This function should render on the client side
router.get('/repoDetails/:id', function (req, res, next) {
  const currentRepo = repoList[req.params.id]
  console.log(currentRepo.releases_url);
  (async function () {
    await request
      .get(`https://api.github.com/repos/GitAnalytics2018/Group-9-Lab/releases`)
      .proxy(proxy)
      .set('Authorization', 'token ' + accessToken)
      .set('accept', 'application/json')
      .then(async function (results) {
        console.log(results.body)
        var releases = ['2018-08-03', '2018-08-07', '2018-08-11', '2018-08-15', '2018-08-19', '2018-08-23']
        getReleaseDates(releases)
        dateCreated(releases)
      })
    console.log(daysElapsed)
    // console.log(releaseTags)
    res.render('timeline', {currentRepo: currentRepo})
  })()
})
// gets the number of days between the release dates
function noOfDays (date1, date2) {
  var firstDate = Math.ceil(date1.getTime())
  var secDate = Math.ceil(date2.getTime())
  console.log('first date is: ' + firstDate)
  console.log('second date is: ' + secDate)
  var diff = secDate - firstDate
  var days = 1000 * 60 * 60 * 24 // this gives a day in milliseconds
  var noDays = diff / days
  return noDays
}

// gets the release dates and stores them
function getReleaseDates (releases) {
  var releaseDates = []
  var releaseTags = []
  for (var i = 0; i < releases.length; i++) {
    releaseDates[i] = new Date(releases[i].substring(0, 10))
    // releaseTags[i] = releases[i].tag_name
    if (i !== 0) {
      daysElapsed[i - 1] = noOfDays(releaseDates[i - 1], releaseDates[i])
      checkDays(daysElapsed[i], daysElapsed[0])
    }
  }
  console.log(releaseTags)
}

function dateCreated (releases) {
  if (releases.length !== 0) {
    createDate = releases[0].created_at
  }
  console.log(createDate)
}

function checkDays (currentDiff, firstDiff) {
  return currentDiff === firstDiff
}

module.exports = router
