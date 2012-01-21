'use strict'

var assert = require('assert')
var async = require('async')

var Server = require('../lib/server')
var Client = require('../lib/client')

var PORT = 5000

describe('client', function() {
  var server, client, remote
  describe('connection', function() {
    after(function(done) {
      server.shutdown(function() {
        client.shutdown(function() {
          server = null
          client = null
          done()
        })
      })
    })

    afterEach(function(done) {
      async.parallel([function(next) {
        if (server) {
          server.shutdown(next) 
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
      server = new Server(PORT)

    })
    it('fires ready when ready', function(done) {
      client = new Client(PORT)
      client.on('ready', function() {
        done()
      })
      server = new Server(PORT)
    })
    it('can connect to a server', function(done) {
      server = new Server(PORT)
      client = new Client(PORT)

      client.once('ready', function(remote) {
        assert.ok(remote)
        done()
      })
    })
    it('can shut down a client', function(done) {
      server = new Server(PORT)
      client = new Client(PORT)

      client.once('ready', function(remote) {
        client.shutdown(function() {
          server.once('connected', function() {
            throw new Error('Should not connect!')
          })
          setTimeout(function() {
            done()
          }, 30)
        })
      })
    })
    it('can shut down a client and listen for shutdown event', function(done) {
      server = new Server(PORT)
      client = new Client(PORT)

      client.once('ready', function(remote) {
        client.once('shutdown', function() {
          server.once('connected', function() {
            throw new Error('Should not connect!')
          })
          setTimeout(function() {
            done()
          }, 30)
        })
        client.shutdown()
      })
    })
    it('can access server api', function(done) {
      var api = {
        test: function(callback) {
          callback(null, 'success')
        }
      }
      server = new Server(PORT, api)
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
    it('won\'t crash if server is down', function(done) {
      client = new Client(PORT)
      assert.ok(client)
      done()
    })
    it('won\'t disconnect client and will buffer commands if server is down for some other reason than a shutdown', function(done) {
      var api = {
        test: function(callback) {
          callback(null, 'success')
        }
      }
      server = new Server(PORT, api, function() {
        server.dnode.once('close', function() {
          client = new Client(PORT, function(remote) {
            remote.test(function(err, value) {
              done()
            })
          })
          server.listen(PORT)
        })
        server.dnode.close()
      })
    })
  })
})

