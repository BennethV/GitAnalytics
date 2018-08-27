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
var userInfo = {
  'accessToken': '',
  'username': '',
  'organisation': '',
  'repository': ''
}
/* GET users listing. */

router.post('/', function (req, res, next) {
  // we need this because we are making an outgoing reques to another server
  accessToken = req.body.accessToken
  userInfo.accessToken = req.body.accessToken;
  (async function () {
    try {
      // from here we can then add the URLs for statistics using our synchronous functions.
      // This gets information about the user
      // first check whether user wants to use proxies or not
      if (process.env.PROXY_REQUIRED === 'true') {
        await request
          .get('https://api.github.com/user')
          .proxy(process.env.HTTP_PROXY)
          .set('Authorization', 'token ' + accessToken)
          .set('accept', 'application/json')
          .then(async function (results) {
            // Gets list of organizations that the user has
            await request
              .get(results.body.organizations_url)
              .proxy(process.env.HTTP_PROXY)
              .set('Authorization', 'token ' + accessToken)
              .set('accept', 'application/json')
              .then(function (organizations) {
                orgs = organizations.body // a for lop for putiting the organizaions into an array
                for (var i = 0; i < orgs.length; i++) {
                  orgNames[i] = orgs[i].login
                }
              })
          })
      } else {
        await request
          .get('https://api.github.com/user')
          .set('Authorization', 'token ' + accessToken)
          .set('accept', 'application/json')
          .then(async function (results) {
            // Gets list of organizations that the user has
            await request
              .get(results.body.organizations_url)
              .set('Authorization', 'token ' + accessToken)
              .set('accept', 'application/json')
              .then(function (organizations) {
                orgs = organizations.body // a for lop for putiting the organizaions into an array
                for (var i = 0; i < orgs.length; i++) {
                  orgNames[i] = orgs[i].login
                }
              })
          })
      }
      res.render('organisation', {orgNames: orgNames})
    } catch (err) { console.log(err) }
  })()
})

router.get('/orgDetails/:id', function (req, res, next) {
  const currentOrg = orgs[req.params.id]
  selectedOrg = currentOrg.login
  userInfo.organisation = currentOrg.login
  const repoUrl = currentOrg.repos_url
  if (process.env.PROXY_REQUIRED === 'true') {
    (async function () {
      await request
        .get(repoUrl)
        .proxy(process.env.HTTP_PROXY)
        .set('Authorization', 'token ' + accessToken)
        .set('accept', 'application/json')
        .then(function (repos) {
          repoList = repos.body
          for (var i = 0; i < repoList.length; i++) {
            repoNames[i] = repoList[i].name
          }
        })
      await res.render('organisation', {repoNames: repoNames})
    })()
  } else {
    (async function () {
      await request
        .get(repoUrl)
        .set('Authorization', 'token ' + accessToken)
        .set('accept', 'application/json')
        .then(function (repos) {
          repoList = repos.body
          for (var i = 0; i < repoList.length; i++) {
            repoNames[i] = repoList[i].name
          }
        })
      await res.render('organisation', {repoNames: repoNames})
    })()
  }
})

router.get('/charts/:id', function (req, res, next) {
  userInfo.repository = repoNames[req.params.id]
  fs.writeFile(__dirname + '\\..\\public\\javascripts\\data.json', JSON.stringify(userInfo), function (err) {
    if (err) throw err
    console.log(err)
  })
  res.redirect('/charts')
})

module.exports = router
