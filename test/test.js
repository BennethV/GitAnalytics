// http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../app')
var should = chai.should()

chai.use(chaiHttp)

describe('Server Setup', function () {
  it('should GET the main page', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res) {
        res.should.have.status(200)
        done()
      })
  })
  it('should succesfully submit username', function (done) {
  	this.timeout(30000)
  	chai.request(server)
  	.post('/')
  	.send({username: 'BennethV'})
  	.end(function (err, res) {
  		 console.log(res.body)
  		res.should.have.status(200)
  		done()
  	})
  })
})
