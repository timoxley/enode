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
  
  this.host = host || this.host
  
  var self = this
  this.dnode = dnode(function(remote, connection) {
    _(this).extend(self._api)
    self.emit('connected', connection, this)

  }).use(upnode.ping).listen(host)
}

Server.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}

}

module.exports = Server
