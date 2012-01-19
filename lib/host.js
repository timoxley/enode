'use strict'

var dnode = require('dnode')
var upnode = require('upnode') 

var EventEmitter = require('events').EventEmitter


var Host = module.exports = exports = function(host, api, callback) {
  // api is optional
  if (arguments.length === 2 && typeof api === 'function') {
    callback = api
    api = {}
  }
  var self = this
  this.api = api || {}
  this.running = false
  process.nextTick(function() {
    self.listen(host, callback)
  })
  this._stopRunning = function() {
    self.running = false
  }
}

Host.prototype = new EventEmitter


Host.prototype.listen = function(host, callback) {
  this.server = dnode(this.api)
  this.server.use(upnode.ping)
  this.server.listen(host)
  var self = this
  this.server.on('close', this._stopRunning) 
  
  return process.nextTick(function() {
    self.running = true
    self.emit('ready')
    if (typeof callback === 'function') {
      callback()
    }
  })
}

Host.prototype.shutdown = function(callback) {
  if (!this.running) {
    if (typeof callback === 'function') {
      return process.nextTick(function() {
        callback()
      })
    } else {
      return
    }
  }
  this._stopRunning()
  this.removeListener('close', this._stopRunning)
  var self = this
  this.server.once('close', function() {
    return process.nextTick(function() {
      typeof callback === 'function' && callback()
    })
  })
  this.server.close()
  this.server.end()
}

module.exports = Host
