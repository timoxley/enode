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
    it('won\'t reconnect after shutdown', function(done) {
      client = new Client().connect(PORT)
      client.shutdown(function() {
        done()
      })
      client.on('ready', function(api, connection) {
        throw new Error('Should not connect after shutdown')
      })
    })
    it('will close connection on shutdown', function(done) {
      client = new Client().connect(PORT)
      client.on('ready', function(api, connection) {
        client.shutdown(function() {
          assert.ok(client.up.closed)
          done()
        })
      })
    })
    it('will cancel connecting if shutdown', function(done) {
      server.on('connect', function() {
        throw new Error('Should not connect')
      })
      client = new Client().connect(PORT, function() {
        throw new Error('Should not fire callback')
      })
      client.on('ready', function() {
        throw new Error('Should not ready')
      })
      client.shutdown(function() {
        done()
      })
    })
    it('will successfully shutdown multiple times after startup', function(done) {
      server.on('connect', function() {
        throw new Error('Should not connect')
      })
      client = new Client().connect(PORT)
      client.shutdown(function() {
        client.shutdown(function() {
          done()
        })
      })
    })
    it('won\'t error if shutdown multiple times', function(done) {
      client = new Client().connect(PORT)
      client.on('ready', function(api, connection) {
        client.shutdown(function(err) {
          assert.ok(!err)
          client.shutdown(function(err) {
          assert.ok(!err)
            client.shutdown(function(err) {
            assert.ok(!err)
              client.shutdown(function(err) {
                assert.ok(!err)
                assert.ok(client.up.closed)
                done()
              })
            })
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
    it('will emit informative error if can\'t connect', function(done) {
      try {
        client = new Client().connect('garbage', function() {
          throw new Error('Shouldn\'t be ready.')
        })
      } catch(err) {
        console.log(err.message)
        assert.ok(/Could\ not\ create/.test(err.message))
        done()
      }
      client.on('ready', function(api, connection) {
        throw new Error('Shouldn\'t be ready.')
      })
    })
  })
})

