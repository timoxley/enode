'use strict'

var assert = require('chai').assert
var sinon = require('sinon')
var async = require('async')

var Master = require('../lib/master')
var Slave = require('../lib/slave')


var PORT = 5000

describe('slave', function() {
  var master, slave, remote
  describe('connection', function() {
    after(function(done) {
      master.shutdown(function() {
        slave.shutdown(done)
      })
    })

    afterEach(function(done) {
      async.parallel([function(next) {
        master.shutdown(next)
      }, function(next) {
        slave.shutdown(next)
      }], function() {
        done()
      })
    })
    it('can connect to a master', function(done) {
      master = new Master(PORT)
      slave = new Slave(PORT)

      slave.once('up', function(remote) {
        assert.ok(remote)
        done()
      })
    })
    it('can shut down a slave', function(done) {
      master = new Master(PORT)
      slave = new Slave(PORT)

      slave.once('up', function(remote) {
        slave.shutdown(function() {
          done()
        })
      })
    })
  })
  describe('functionality', function() {
    var master, slave, remote
    beforeEach(function(done) {
      master = new Master(PORT)
      slave = new Slave(PORT)

      slave.on('up', function(remote) {
        remote = remote
        done()
      })

    })
    afterEach(function(done) {
      async.parallel([function(next) {
        master.shutdown(next)
      }, function(next) {
        slave.shutdown(function() {
          next()
        })
      }], function() {
        done()
      })
    })
  })
})

