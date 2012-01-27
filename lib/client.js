var dnode = require('dnode')
var upnode = require('upnode')
var url = require('url')

var _ = require('underscore')

var EventEmitter = require('events').EventEmitter

var Client = function(api) {
  this._api = api
}

Client.prototype = new EventEmitter

Client.prototype.connect = function(host, callback) {
  if (typeof callback !== 'function') callback = function(){}
  this.host = host
  var self = this

  this.up = upnode(function() {
    _(this).extend(self._api)
  }).connect(host, function(remote, connection) {
    self.connection = connection
    self.emit('ready', remote, connection)
    return callback()
  })
  return this
}

Client.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}
  var self = this
  if (!this.up.closed) {
    self.up.once('close', function() {
      self.emit('shutdown')
      callback()
    })
    self.up.close()
  } else {
    self.emit('shutdown')
    callback()
  }
}

module.exports = Client
