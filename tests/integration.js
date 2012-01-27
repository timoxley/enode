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
  describe('client', function() {
    it('can call server methods', function(done) {
      var api = {
        status: "working",
        whoami: function(callback) {
          callback(null, "server")
        }
      }
      server = new Server(api).listen(PORT)
      client = new Client().connect(PORT)
      client.once('ready', function(remote) {
        assert.equal(remote.status, "working")
        remote.whoami(function(err, val) {
          assert.equal(val, "server")
          assert.ok(!err)
          done()
        })
      })
    })
    it('api is passed connection/remote to each call', function(done) {
      var connectionId
      var api = {
        status: "working",
        whoami: function(callback, meta) {
          assert.ok(meta.remote)
          assert.ok(meta.connection)
          assert.equal(meta.connection.id, connectionId)
          callback(null, meta.connection)
        }
      }
      server = new Server(api).listen(PORT)
      server.once('connect', function(remote, connection) {
        connectionId = connection.id
      })
      client = new Client().connect(PORT)
      client.once('ready', function(remote, connection) {
        remote.whoami(function(err, val) {
          done()
        })
      })
    })
    it('can send args', function(done) {
      var connectionId
      var api = {
        say: function(word, callback, meta) {
          callback(null, 'I said ' + word)
        }
      }
      server = new Server(api).listen(PORT)
      server.once('connect', function(remote, connection) {
        connectionId = connection.id
      })
      client = new Client().connect(PORT)
      client.once('ready', function(remote, connection) {
        remote.say('cows.', function(err, value) {
          assert.equal(value, 'I said cows.')
          done()
        })
      })
    })
  })
  describe('server', function() {
    it('can call client methods', function(done) {
      var api = {
        status: "working",
        whoami: function(callback) {
          callback(null, "client")
        }
      }
      server = new Server().listen(PORT)
      server.once('connect', function(remote) {
        assert.equal(remote.status, "working")
        remote.whoami(function(err, val) {
          assert.equal(val, "client")
          assert.ok(!err)
          done()
        })
      })

      client = new Client(api).connect(PORT)
    })
    it('api is passed connection/remote to each call', function(done) {
      var connectionId
      var api = {
        status: "working",
        whoami: function(callback, meta) {
          assert.ok(meta.remote)
          assert.ok(meta.connection)
          assert.equal(meta.connection.id, connectionId)
          callback(null, meta.connection)
        }
      }
      server = new Server().listen(PORT)
      server.once('connect', function(remote, connection) {
        remote.whoami(function(err, value) {
          done()
        })
      })
      client = new Client(api).connect(PORT)
      client.once('ready', function(remote, connection) {
        connectionId = connection.id
      })
    })
    it('can send args', function(done) {
      var connectionId
      var api = {
        say: function(word, callback) {
          callback(null, 'I said ' + word)
        }
      }
      server = new Server().listen(PORT)
      server.once('connect', function(remote, connection) {
        remote.say('cows.', function(err, value) {
          assert.equal(value, 'I said cows.')
          server.shutdown(done)
        })
      })
      client = new Client(api).connect(PORT)
      client.once('ready', function(remote, connection) {
        connectionId = connection.id
      })
    })
  })
})

