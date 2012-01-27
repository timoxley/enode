'use strict'

var dnode = require('dnode')
var upnode = require('upnode')
var _ = require('underscore')

var EventEmitter = require('events').EventEmitter

var Server = module.exports = exports = function(api) {
  this.connections = []
  this._api = api || {}
}

Server.prototype = new EventEmitter

Server.prototype.listen = function(host, callback) {

  if (typeof callback != 'function') callback = function(){}

  var self = this
  this.host = host
  this.dnode = dnode(function(remote, connection) {
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
    self.connections.push(connection)
    connection.on('end', function() {
      var index = self.connections.indexOf(connection)
      self.connections.splice(index, 1)
      self.emit('disconnect', connection)
    })
    connection.once('ready', function() {
      self.emit('connect', remote, connection)
    })
  }).use(upnode.ping).listen(host)

  process.nextTick(function() {
    self.ready = true
    self.emit('ready')
    callback()
  })


  return this
}

Server.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}

  var self = this
  if (!this.ready) {
    this.once('ready', function() {
      self.shutdown(callback)
    })
    return
  }
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
