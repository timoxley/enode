'use strict'

var assert = require('assert')

var Server = require('../lib/server')
var Client = require('../lib/client')

var PORT = 5000

var isPortTaken = function(PORT, callback) {
  var net = require('net')
  var tester = net.createServer()
  tester.once('error', function (err) {
    if (err.code == 'EADDRINUSE') {
      callback(null, true)
    } else {
      callback(err)
    }
  })
  tester.once('listening', function() {
    tester.once('close', function() {
      callback(null, false)
    })
    tester.close()
  })
  tester.listen(PORT)
}

describe('client', function() {
  var server
  before(function(done) {
    var server = new Server()
    server.on('error', function(err) {
      throw new Error(err)
    })
    server.listen(PORT, function() {
      done()
    })
  })
  describe('shutdown', function() {
    var client
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
  describe('listening on a port', function() {
    var client
    beforeEach(function(done) {
      if (client) {
        client.shutdown(done)
      } else {
        done()
      }
    })
    afterEach(function(done) {
      if (client) {
        client.shutdown(done)
      } else {
        done()
      }
    })
    it('will use callback when listening on port', function(done) {
      client = new Client().connect(PORT, function() {
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

