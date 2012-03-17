var assert = require('assert')

var async = require('async')
var Server = require('../lib/server')
var Client = require('../lib/client')

var dnode = require('dnode')
var _ = require('underscore')
var PORT = 6000

var isPortTaken = function(port, callback) {
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
  tester.listen(port)
}

describe('server', function() {
  var client, server
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
  describe('shutdown', function() {
    it('will close port on shutdown', function(done) {
      server = new Server()
      server.on('error', function(err) {
        throw new Error(err)
        done()
      })
      server.listen(PORT, function() {
        server.shutdown(function() {
          isPortTaken(PORT, function(err, isTaken) {
            assert.ok(!err)
            assert.ok(!isTaken)
            done()
          })
        })
      })
    })
    it('won\'t error if shutdown twice', function(done) {
      server = new Server()
      server.on('error', function(err) {
        throw new Error(err)
        done()
      })
      server.listen(PORT, function() {
        server.shutdown(function(err) {
          assert.ok(!err)
          server.shutdown(function(err) {
            assert.ok(!err)
            server.shutdown(function(err) {
              assert.ok(!err)
              server.shutdown(function(err) {
                assert.ok(!err)
                isPortTaken(PORT, function(err, isTaken) {
                  assert.ok(!err)
                  assert.ok(!isTaken)
                  done()
                })
              })
            })
          })
        })
      })
    })
  })
  describe('listening on a port', function() {
    it('will use callback when listening on port', function(done) {
      server = new Server().listen(PORT, function(err) {
        assert.ok(!err)
        isPortTaken(PORT, function(err, isTaken) {
          assert.ok(!err)
          assert.ok(isTaken)
          done()
        })
      })
    })
    it('will emit ready when listening on port', function(done) {
      server = new Server().listen(PORT)
      server.on('ready', function() {
        isPortTaken(PORT, function(err, isTaken) {
          assert.ok(!err)
          assert.ok(isTaken)
          done()
        })
      })
    })

  })

  describe('connections', function() {
    beforeEach(function(done) {
      server = new Server().listen(PORT, done)
    })
    it('should emit connect events', function(done) {
      server.once('connect', function(remote, connection) {
        assert.ok(remote)
        assert.ok(connection)
        assert.ok(connection.id)
        done()
      })
      var client = dnode.connect(PORT)
    })
    it('should emit disconnect events', function(done) {
      server.once('connect', function(remote, connection) {
        server.once('disconnect', function(disconnected) {
          assert.equal(connection.id, disconnected.id)
          done()
        })
        client.shutdown()
      })
      client = new Client().connect(PORT)
    })
    describe('server.connections', function() {
      it('should start with zero connections', function() {
        assert.equal(server.connections.length, 0)
      })
      it('should hold connections', function(done) {
        client = new Client().connect(PORT, function(api, conn) {
          assert.equal(server.connections.length, 1)
          done()
        })
      })
      it('should remove connections', function(done) {
        client = new Client().connect(PORT, function(api, conn) {
          assert.equal(server.connections.length, 1)
          client.shutdown(function() {
            assert.equal(server.connections.length, 0)
            done()
          })
        })
      })
      it('should remove multiple connections', function(done) {
        client = new Client().connect(PORT, function(api, conn) {
          assert.equal(server.connections.length, 1)
          var client2 = new Client().connect(PORT, function(api, conn) {
            assert.equal(server.connections.length, 2)
            client.shutdown(function() {
              assert.equal(server.connections.length, 1)
              client2.shutdown(function() {
                assert.equal(server.connections.length, 0)
                done()
              })
            })
          })
        })
      })
      it('should hold multiple connections', function(done) {
        client = new Client().connect(PORT, function(api1, conn1) {
          assert.equal(server.connections.length, 1)
          var client2 = new Client().connect(PORT, function(api2, conn2) {
            assert.equal(server.connections.length, 2)
            client2.shutdown(function() {
              done()
            })
          })
        })
      })
    })
  })
})
