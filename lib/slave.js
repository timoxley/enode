var bigint = require('bigint')
var dnode = require('dnode')
var upnode = require('upnode')
var url = require('url')

var EventEmitter = require('events').EventEmitter

var Slave = function(host) {
  var self = this
  this.running = false
  process.nextTick(function() {
    self.connect(host)
  })
}

Slave.prototype = new EventEmitter

Slave.prototype.connect = function(host, callback) {
  this.up = upnode.connect(host)
  var self = this
  this.up(function(remote, connection) {
    self.connection = connection
    self.up.on('up', function(remote) {
      
      self.running = true
      self.emit('up', remote)
    })
    self.connection.on('down', function() {
      self.emit('down')
    })
    self.connection.on('end', function() {
      self.running = false

      self.emit('end')
    })
  })
}


Slave.prototype.shutdown = function(callback) {
  if (!this.running) {
    if (typeof callback === 'function') {
      return process.nextTick(function() {
        callback()
      })
    }
  }
  this.connection.once('end', function() {
    if (typeof callback === 'function') {
      return process.nextTick(function() {
        callback()
      })
    }
  })
  this.connection.end()
}
module.exports = Slave
