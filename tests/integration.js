'use strict'

var assert = require('assert')

var async = require('async')
var Server = require('../lib/server')
var Client = require('../lib/client')

var PORT = 5000
describe('handing an API', function() {
  var server, client
  function shutdown(done) {
    async.parallel([
      function(next) {
        if (server) {
          server.shutdown(next)
        } else {
          next()
        }
      },
      function(next) {
        if (client) {
          client.shutdown(next)
        } else {
          next()
        }
      }
    ], function(err) {
      done(err)
    })
  }
  beforeEach(shutdown)
  afterEach(shutdown)

  it('client can call server methods', function(done) {
    var api = {
      status: "working",
      whoami: function(callback) {
        callback(null, "server")
      }
    }
    server = new Server(api).listen(PORT)
    client = new Client().connect(PORT)
    client.on('ready', function(remote) {
      assert.equal(remote.status, "working")
      remote.whoami(function(err, val) {
        assert.equal(val, "server")
        assert.ok(!err)
        done()
      })
    })
  })
  it('server can call client methods', function(done) {
    var api = {
      status: "working",
      whoami: function(callback) {
        callback(null, "client")
      }
    }
    server = new Server().listen(PORT)
    server.on('connect', function(remote) {
      assert.equal(remote.status, "working")
      remote.whoami(function(err, val) {
        assert.equal(val, "client")
        assert.ok(!err)
        done()
      })
    })

    client = new Client(api).connect(PORT)
  })
})

