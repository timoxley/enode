'use strict'

var assert = require('assert')
var async = require('async')

var Host = require('../lib/host')
var Client = require('../lib/client')

var PORT = 5000

describe('host', function() {
  after(function(done) {
    host.shutdown(function() {
      client.shutdown(function() {
        done()
      })
    })
  })
  var host, client
  describe('connection', function() {
    afterEach(function(done) {
      host.shutdown(function() {
        done()
      })
    })
    it('will disconnect clients', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)
      client.once('up', function() {
        // this should trigger client to end
        host.shutdown()
      })
      client.once('end', function() {
        client.shutdown(done)
      })
    })
    it('can tell when it\'s running', function(done) {
      host = new Host(PORT, function() {
        assert.ok(host.running)
        done()
      })
      assert.ok(!host.running)
    })
    it('won\'t error if trying to shutdown more than once', function(done) {
      host = new Host(PORT, function() {
        host.shutdown(function() {
          host.shutdown(function() {
            done()
          })
        })
        host.shutdown()
      })
      host.shutdown()
    }) 
    it('can start up new hosts on same port after shutdown', function(done) {
      host = new Host(PORT, function() {
        host.shutdown(function() {
          var host2 = new Host(PORT, function() {
            host2.shutdown(done)
          })
        })
      })
    })
  })
})
