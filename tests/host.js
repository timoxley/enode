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
      async.parallel([function(next) {
        if (host) {
          host.shutdown(next) 
        } else {
          next()
        }
      }, function(next) {
        if (client) {
          client.shutdown(next) 
        } else {
          next()
        }
      }], function() {
        done()
      })
    })
    it('will disconnect all clients on shutdown', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)
      client.once('ready', function() {
        // this should trigger client to end
        host.shutdown()
      })
      client.once('end', function() {
        client.shutdown(function() {
          done()
        })
      })
    })
    it('can tell when it\'s isConnected', function(done) {
      host = new Host(PORT, function() {
        assert.ok(host.isConnected)
        done()
      })
      assert.ok(!host.isConnected)
    })
    it('won\'t report isConnected if down', function(done) {
      host = new Host(PORT, function(test) {
        host.server.on('close', function() {
          assert.ok(!host.isConnected)
          done()
        })
        host.server.close()
      })

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
    it('won\'t error if trying to shutdown already closed connection', function(done) {
      host = new Host(PORT, function() {
        host.server.on('close', function() {
          host.shutdown(function() {
            done()
          })
        })
        host.server.close()
      })
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
    it('can re-listen if is disconnected for some reason', function(done) {
      host = new Host(PORT, function() {
          assert.ok(host.isConnected)
          host.server.on('close', function() {
            assert.ok(!host.isConnected)
            host.listen(function() {
              assert.ok(host.isConnected)
              done()
            })
          })
          // simulate 'disconnection'
          host.server.close()
      })
    })
  })
})
