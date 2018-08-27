// http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../app')
var should = chai.should()

chai.use(chaiHttp)

describe('Server-Side Setup: sign in, select organisation and select repository.', function () {
  it('should GET the sign-in (personal access token) page.', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res) {
        res.should.have.status(200)
        if (err) { throw (err) }
        done()
      })
  })
  // it('Should fail if wrong access token is used', function (done) {
  //   this.timeout(30000)
  //   chai.request(server)
  //     .post('/users')
  //     .send({accessToken: '02172280c1124fceccec819313386cce2a7fa894'})
  //     .end(function (err, res) {

  //       res.should.have.status(200)
  //       if (err) { throw err }
  //       done()
  //     })
  // })
})
describe('Checks if GitHub API is Working and can return information', function () {
  it('Should get to the GitHub API.', function (done) {
    this.timeout(30000)
    chai.request(server)
      .get('https://api.github.com/')
      .end(function (err, res) {
        res.should.have.status(200)
        if (err) { throw (err) }
        done()
      })
  })
  it('Should get to the GitHub API and get users details', function (done) {
    chai.request(server)
      .get('https://api.github.com/user')
      .end(function (err, res) {
        res.should.have.status(200)
        if (err) { throw (err) }
        done()
      })
  })
  it('Should get to the GitHub API and get an organisations details', function (done) {
    chai.request(server)
      .get('https://api.github.com/orgs/github')
      .end(function (err, res) {
        res.should.have.status(200)
        if (err) { throw (err) }
        done()
      })
  })
  it('Should get to the GitHub API and get an organisations repositories', function (done) {
    chai.request(server)
      .get('https://api.github.com/orgs/github/repos')
      .end(function (err, res) {
        res.should.have.status(200)
        if (err) { throw (err) }
        done()
      })
  })

  // it('Should fail if wrong access token is used', function (done) {
  //   this.timeout(30000)
  //   chai.request(server)
  //     .post('/users')
  //     .send({accessToken: '02172280c1124fceccec819313386cce2a7fa894'})
  //     .end(function (err, res) {

  //       res.should.have.status(200)
  //       if (err) { throw err }
  //       done()
  //     })
  // })
})
