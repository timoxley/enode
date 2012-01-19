var dnode = require('dnode')
var upnode = require('upnode')
var url = require('url')

var EventEmitter = require('events').EventEmitter

var Client = function(host, callback) {
  var self = this
  this.isConnected = false
  this.isShutdown = false
  process.nextTick(function() {
    self.connect(host, callback)
  })
}

Client.prototype = new EventEmitter

Client.prototype.connect = function(host, callback) {
  if (this.isShutdown) return
    
  if (typeof callback !== 'function') callback = function(){}
  this.up = upnode.connect(host)
  var self = this
  this.up(function(remote, connection) {
    if (self.isShutdown) return

    self.connection = connection
    self.up.once('up', function(remote) {
      if (self.isShutdown) return
      self.isConnected = true
      typeof callback === 'function' && callback(remote)
      self.emit('ready', remote)
    })
    self.connection.on('down', function() {
      self.emit('down')
    })
    self.connection.on('end', function() {
      self.isConnected = false

      self.emit('end')
    })
  })
}


Client.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}

  this.isShutdown = true
  this.removeAllListeners()
  this.up.removeAllListeners()
  if (!this.isConnected || this.isShutdown) {
    return process.nextTick(function() {
      callback()
    })
  }
  this.connection.once('end', function() {
    return process.nextTick(function() {
      callback()
    })
  })
  this.connection.end()
}
module.exports = Client
