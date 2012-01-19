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
        client.shutdown(function() {
          host = null
          client = null
          done()
        })
      })
    })

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
    it('won\'t execute callback unless ready', function() {
      client = new Client(PORT, function() {
        throw new Error('Shouldn\'t fire')
      })
    })
    it('executes callback when connected', function(done) {
      client = new Client(PORT, function() {
        done()
      })
      host = new Host(PORT)

    })
    it('fires ready when ready', function(done) {
      client = new Client(PORT)
      client.on('ready', function() {
        done()
      })
      host = new Host(PORT)
    })
    it('can connect to a host', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)

      client.once('ready', function(remote) {
        assert.ok(remote)
        done()
      })
    })
    it('can shut down a client', function(done) {
      host = new Host(PORT)
      client = new Client(PORT)

      client.once('ready', function(remote) {
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

      client.once('ready', function(remote) {
        assert.ok(remote.test && typeof remote.test === 'function')
        remote.test(function(err, value) {
          assert.ok(!err)
          assert.ok(value === 'success')
          done()
        })
      })
    })
    it('won\'t crash if host is down', function(done) {
      client = new Client(PORT)
      assert.ok(client)
      done()
    })
    it('won\'t disconnect client and will buffer commands if host is down for some other reason than a shutdown', function(done) {
      var api = {
        test: function(callback) {
          callback(null, 'success')
        }
      }
      host = new Host(PORT, api, function() {
        host.server.once('close', function() {
          client = new Client(PORT, function(remote) {
            remote.test(function(err, value) {
              done()
            })
          })
          host.listen(PORT)
        })
        host.server.close()
      })
    })
  })
})

