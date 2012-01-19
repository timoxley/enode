'use strict'

var assert = require('assert')
var async = require('async')

var Master = require('../lib/master')
var Slave = require('../lib/slave')

var PORT = 5000

describe('master', function() {
  after(function(done) {
    master.shutdown(function() {
      slave.shutdown(function() {
        done()
      })
    })
  })
  var master, slave, remote
  describe('connection', function() {
    afterEach(function(done) {
      master.shutdown(function() {
        done()
      })
    })
    it('will disconnect slaves', function(done) {
      master = new Master(PORT)
      slave = new Slave(PORT)

      slave.once('end', function() {
        slave.shutdown(done)
      })
      slave.once('up', function(remote) {
        // this should trigger slave to end
        master.shutdown()
      })
    })
    it('can tell when it\'s running', function(done) {
      master = new Master(PORT, function() {
        assert.ok(master.running)
        done()
      })
      assert.ok(!master.running)
    })
    it('won\'t error if trying to shutdown more than once', function(done) {
      master = new Master(PORT, function() {
        master.shutdown(function() {
          master.shutdown(function() {
            done()
          })
        })
        master.shutdown()
      })
      master.shutdown()
    }) 
    it('can start up new masters on same port after shutdown', function(done) {
      master = new Master(PORT, function() {
        master.shutdown(function() {
          var master2 = new Master(PORT, function() {
            master2.shutdown(done)
          })
        })
      })
    })
  })
})
