'use strict'

var dnode = require('dnode')
var upnode = require('upnode') 
var _ = require('underscore')
var EventEmitter = require('events').EventEmitter


var Host = module.exports = exports = function(host, api, callback) {
  // api is optional
  if (arguments.length === 2 && typeof api === 'function') {
    callback = api
    api = {}
  }
  var self = this
  this._api = api || {}
  this.host = host
  this.isConnected = false
  this.isShutdown = false
  process.nextTick(function() {
    self.listen(host, callback)
  })
}

Host.prototype = new EventEmitter

Host.prototype.listen = function(host, callback) {
  // host optional if we already provided it
  if (arguments.length == 1 && typeof host === 'function') {
    callback = host
    host = this.host
  }
  if (typeof callback != 'function') callback = function(){}
  
  if (this.isShutdown) return callback()

  this.host = host || this.host
  
  var self = this
  this.server = dnode(function(remote, connection) {
    _(this).extend(self._api)
    self.emit('connected', self)
  }).use(upnode.ping).listen(host)

  this.server.on('close', function() {
    self.isConnected = false
  })
  this.server.once('ready', function() { 
    self.isConnected = true
    self.emit('ready')
    callback()
  })

}

Host.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}
  if (!this.isConnected || this.isShutdown) {
    return process.nextTick(function() {
      callback()
    })
  }

  this.isShutdown = true
  this.isConnected = false
  this.removeAllListeners()
  this.server.removeAllListeners()
  var self = this
  this.server.once('close', function() {
    self.server = null
    return process.nextTick(function() {
      callback()
    })
  })
  this.server.end()
  this.server.close()
}

module.exports = Host
