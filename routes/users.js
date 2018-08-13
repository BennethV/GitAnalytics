// required headers for access token
var express = require('express')
var path = require('path')
var router = express.Router()
const request = require('superagent')
require('superagent-proxy')(request)
var fetch = require('node-fetch')
var accessToken = ''
var orgNames = []
var orgs = {}
var selectedOrg = ''
var repoList = []
var repoNames = []
var fs = require('fs')
var proxy = process.env.http_proxy || 'http://students%5C1077310:18Barnato@1051@proxyss.wits.ac.za:80'
var userInfo ={
  'accessToken':'',
  'username':'',
  'organisation':'',
  'repository': ''
}
/* GET users listing. */

router.post('/', function (req, res, next) {

  // we need this because we are making an outgoing reques to another server
  accessToken = req.body.accessToken;
  userInfo.accessToken = req.body.accessToken;
  (async function () {
    try {
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

    } catch (err) { console.log(err) }
  })()
})

router.get('/orgDetails/:id', function (req, res, next) {
  const currentOrg = orgs[req.params.id]
  selectedOrg = currentOrg.login
  userInfo.organisation = currentOrg.login
  const repoUrl = currentOrg.repos_url;
  
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

router.get('/charts/:id', function (req, res, next) {
  userInfo.repository = repoNames[req.params.id]
fs.writeFile(__dirname + '\\..\\public\\javascripts\\data.json',JSON.stringify(userInfo), function (err) {
            if (err) throw err
            console.log(err)
          })
  res.sendFile(path.join(__dirname,'../views','charts.html'))
})

module.exports = router
