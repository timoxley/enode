'use strict'

var assert = require('assert')
var async = require('async')

var Server = require('../lib/server')
var Client = require('../lib/client')

var PORT = 5000

describe('client', function() {
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
    beforeEach(function(done) {
    server = new Server()
    server.on('error', function(err) {
      throw new Error(err)
    })
    server.listen(PORT, function() {
      done()
    })
  })

  describe('shutdown', function() {
    it('will close connection on shutdown', function(done) {
      client = new Client().connect(PORT)
      client.on('ready', function(api, connection) {
        client.shutdown(function() {
          assert.ok(client.up.closed)
          done()
        })
      })
    })
    it('won\'t error if shutdown twice', function(done) {
      client = new Client().connect(PORT)
      client.on('ready', function(api, connection) {
        client.shutdown(function() {
          client.shutdown(function() {
            assert.ok(client.up.closed)
            done()
          })
        })
      })
    })
  })
  describe('connecting to a port', function() {
    it('will use callback when listening on port', function(done) {
      client = new Client().connect(PORT, function(err, remote, connection) {
        assert.ok(!err)
        assert.ok(remote)
        assert.ok(connection.id)
        done()
      })
    })
    it('will emit ready when connected, passing connection object', function(done) {
      client = new Client().connect(PORT)
      client.on('ready', function(api, connection) {
        assert.ok(connection.id)
        done()
      })
    })
  })
})

