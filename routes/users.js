// required headers for access token
var express = require('express')
var router = express.Router()
const request = require('superagent')
require('superagent-proxy')(request)
var fetch = require('node-fetch')
const clientId = 'f21ee8a6c540fb41ea46'
const clientSecret = '3e32822cdc778f98ba0b9c21e016cac4941fcd2f'
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
              console.log('got user information, organization url is: ' + results.body.organizations_url)
              // Gets list of organizations that the user has

              await request
                .get(results.body.organizations_url)
                .proxy(proxy)
                .set('Authorization', 'token ' + accessToken)
                .set('accept', 'application/json')
                .then(function (organizations) {
                  orgs = organizations.body // a for lop for putiting the organizaions into an array
                  console.log('list of organizations is ' + orgs)
                  for (var i = 0; i < orgs.length; i++) {
                    orgNames[i] = orgs[i].login
                  }
                })
            })
          console.log('this is the saved list of repos ' + orgNames)
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
        console.log(repoList)
        for (var i = 0; i < repoList.length; i++) {
          repoNames[i] = repoList[i].name
        }
      })
    await res.render('index', {repoNames: repoNames})
  })()
})

module.exports = router
