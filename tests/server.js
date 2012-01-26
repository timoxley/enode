var assert = require('assert')

var Server = require('../lib/server')

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

describe('server', function() {
  describe('shutdown', function() {
    it('will close port on shutdown', function(done) {
      var server = new Server()
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
      var server = new Server()
      server.on('error', function(err) {
        throw new Error(err)
        done()
      })
      server.listen(PORT, function() {
        server.shutdown(function() {
          server.shutdown(function() {
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
  describe('listening on a port', function() {
    var server
    beforeEach(function(done) {
      if (server) {
        server.shutdown(done)
      } else {
        done()
      }
    })
    afterEach(function(done) {
      if (server) {
        server.shutdown(done)
      } else {
        done()
      }
    })
    it('will use callback when listening on port', function(done) {
      server = new Server().listen(PORT, function() {
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
    describe('connections', function() {
      it('should emit connect events', function(done) {
        server = new Server().listen(PORT)
        server.on('ready', function() {
          server.on('connect', function(connection) {
            assert.ok(connection)
            assert.ok(connection.id)
            done()
          })
          var dnode = require('dnode')
          var client = dnode.connect(PORT)
        })
      })
    })
  })
})
