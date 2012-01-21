'use strict'

var assert = require('assert')
var async = require('async')

var Server = require('../lib/server')
var Client = require('../lib/client')

var PORT = 5000

describe('server', function() {
  var server, client
  describe('shutdown', function() {
    it('won\'t error if trying to shutdown more than once', function(done) {
      server = new Server(PORT, function() {
        server.shutdown(function() {
          server.shutdown(function() {
            done()
          })
        })
        server.shutdown()
      })
      server.shutdown()
    }) 
    it('won\'t error if trying to shutdown already closed connection', function(done) {
      server = new Server(PORT, function() {
        server.dnode.on('close', function() {
          server.shutdown(function() {
            done()
          })
        })
        server.dnode.close()
      })
    })
    it('can start up new servers on same port after shutdown', function(done) {
      server = new Server(PORT, function() {
        server.shutdown(function() {
          var server2 = new Server(PORT, function() {
            server2.shutdown(done)
          })
        })
      })
    })
    it('will end (not shutdown) all clients on server shutdown', function(done) {
      server = new Server(PORT)
      client = new Client(PORT)
      client.once('ready', function() {
        // this should trigger client to end
        server.shutdown()
      })
      client.once('end', function() {
        console.log('end')
        client.on('up', function() {
          throw new Error('Client should be down.')
        })
        client.shutdown(function() {
          console.log('shutdown')
        })
      })
    })
  })
  describe('startup', function() {
    it('will emit ready when listening', function(done) {
      server = new Server(PORT)
      server.once('ready', function() {
        var a = new Server(PORT)
        a.once('error', function(err) {
          assert.equal(err.code, 'EADDRINUSE')
          server.shutdown(done)
        })
      })
    })
    it('will execute callback when listening', function(done) {
      server = new Server(PORT, function() {
        var a = new Server(PORT)
        a.once('error', function(err) {
          assert.equal(err.code, 'EADDRINUSE')
          a.shutdown(function() {
            server.shutdown(done)
          })
        })
      })
    })
  })
  describe('listening', function() {
    it('can re-listen if is disconnected for some reason', function(done) {
      server = new Server(PORT, function() {
          assert.ok(server.isListening)
          server.dnode.on('close', function() {
            assert.ok(!server.isListening)
            server.listen(function() {
              assert.ok(server.isListening)
              server.shutdown(done)
            })
          })
          // create a 'disconnection'
          server.dnode.close()
      })
    })
    it('can tell when it\'s isListening', function(done) {
      server = new Server(PORT, function() {
        assert.ok(server.isListening)
        done()
      })
      assert.ok(!server.isListening)
    })
    it('won\'t report isListening if down', function(done) {
      server = new Server(PORT, function() {
        server.dnode.on('close', function() {
          assert.ok(!server.isListening)
          server.shutdown(done)
        })
        server.dnode.close()
      })
    })
  })
  describe('connections', function() {
    it('will emit connected when a client connects', function(done) {
      server = new Server(PORT)
      server.on('connected', function() {
        console.log(client)
        console.log('connected', arguments)
        server.shutdown(done)
      })
    })
    //it('will send connection with connect event', function(done) {
      //server = new Server(PORT)
      //server.on('connected', function(connection) {
        //assert.ok(connection.id)
        //done()
      //})
    //})
  })
})
