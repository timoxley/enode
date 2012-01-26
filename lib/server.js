'use strict'

var dnode = require('dnode')
var upnode = require('upnode')
var _ = require('underscore')
var EventEmitter = require('events').EventEmitter

var Server = module.exports = exports = function(api) {
  var self = this
  this._api = api || {}
}

Server.prototype = new EventEmitter

Server.prototype.listen = function(host, callback) {
  // host optional if we already provided it
  if (arguments.length == 1 && typeof host === 'function') {
    callback = host
    host = this.host
  }
  if (typeof callback != 'function') callback = function(){}

  var self = this
  this.dnode = dnode(function(remote, connection) {
    //_(this).extend(self._api)
    self.emit('connect', connection, this)

  }).use(upnode.ping).listen(host)

  this.dnode.on('ready', function() {
    self.emit('ready')
    callback()
  })

  return this
}

Server.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}

  var self = this

  this.dnode.once('close', function() {
    self.emit('close')
    return callback()
  })

  try {
    this.dnode.end()
    this.dnode.close()
  } catch(err) {
    if (err.message === 'Not running') {
      return callback()
    } else {
      return callback(err)
    }
  }
  return this
}

module.exports = Server
