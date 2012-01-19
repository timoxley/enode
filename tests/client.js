'use strict'

var assert = require('assert')
var async = require('async')

var Host = require('../lib/host')
var Client = require('../lib/client')

var PORT = 5000

describe('client', function() {
  var host, client, remote
  describe('connection', function() {
    after(function(done) {
      host.shutdown(function() {
        client.shutdown(done)
      })
    })

    afterEach(function(done) {
      async.parallel([function(next) {
        host.shutdown(next)
      }, function(next) {
        client.shutdown(next)
      }], function() {
        done()
      })
    })
    it('can connect to a host', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)

      client.once('up', function(remote) {
        assert.ok(remote)
        done()
      })
    })
    it('can shut down a client', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)

      client.once('up', function(remote) {
        client.shutdown(function() {
          done()
        })
      })
    })
    it('can access host api', function(done) {
      var api = {
        test: function(callback) {
          callback(null, 'success')
        }
      }
      host = new Host(PORT, api)
      client = new Client(PORT)

      client.on('up', function(remote) {
        assert.ok(remote.test && typeof remote.test === 'function')
        remote.test(function(err, value) {
          assert.ok(!err)
          assert.ok(value === 'success')
          done()
        })
      })
    })
  })
})

