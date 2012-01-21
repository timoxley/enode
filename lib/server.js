'use strict'

var dnode = require('dnode')
var upnode = require('upnode') 
var _ = require('underscore')
var EventEmitter = require('events').EventEmitter


var Server = module.exports = exports = function(host, api, callback) {
  // api is optional
  if (arguments.length === 2 && typeof api === 'function') {
    callback = api
    api = {}
  }
  var self = this
  this._api = api || {}
  this.host = host
  this.isListening = false
  this.isShutdown = false
  process.nextTick(function() {
    self.listen(host, callback)
  })
}

Server.prototype = new EventEmitter

Server.prototype.listen = function(host, callback) {
  // host optional if we already provided it
  if (arguments.length == 1 && typeof host === 'function') {
    callback = host
    host = this.host
  }
  if (typeof callback != 'function') callback = function(){}
  
  if (this.isShutdown) return callback()

  this.host = host || this.host
  
  var self = this
  this.dnode = dnode(function(remote, connection) {
    console.log(arguments)
    _(this).extend(self._api)
    self.emit('connected', connection, this)

  }).use(upnode.ping).listen(host)
  this.dnode.on('error', function(err) {
    self.emit('error', err)
  })
  this.dnode.on('ready', function() {
    self.isListening = true
    self.emit('ready')
  })
  this.dnode.once('ready', function() {
      return callback()
  })
  this.dnode.on('close', function() {
    self.isListening = false
  })
}

Server.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}
  if (!this.isListening || this.isShutdown) {
    return process.nextTick(function() {
      callback()
    })
  }

  this.isShutdown = true
  this.isListening = false
  this.removeAllListeners()
  this.dnode.removeAllListeners()
  var self = this
  this.dnode.once('close', function() {
    self.dnode = null
    return process.nextTick(function() {
      callback()
    })
  })
  this.dnode.end()
  this.dnode.close()
}

module.exports = Server
