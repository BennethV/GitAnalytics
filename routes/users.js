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
router.get('/repoDetails/:id', function (req, res, next) {
  const currentRepo = repoList[req.params.id]
  res.render('index', {currentRepo: currentRepo})
})

module.exports = router
