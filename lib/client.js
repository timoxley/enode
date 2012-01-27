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
  this.ready = false
  var self = this

  this.up = upnode(function(remote, connection) {
    var wrappedAPI = {}
    _.each(self._api, function(value, name) {
      if (typeof value === 'function') {
        wrappedAPI[name] = function(callback) {
          value(callback, remote, connection)
        }
      } else {
        wrappedAPI[name] = value
      }
    })

    _(this).extend(wrappedAPI)
  }).connect(host, function(remote, connection) {
   
    self.connection = connection
    connection.emit('up', remote);
  })

  this.up.once('remote', function() {
    self.up.once('up', function(remote) {
      self.ready = true
      self.emit('ready', remote, self.connection)
      return callback()
    })
  })
  return this
}

Client.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}
  var self = this
  if (!this.ready) {
    this.once('ready', function() {
      self.shutdown(callback)
    })
    return
  }
  if (!this.up.closed && self.connection) {
    self.connection.once('end', function() {
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
