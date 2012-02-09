'use strict'

var dnode = require('dnode')
var upnode = require('upnode')
var _ = require('underscore')
var EventEmitter = require('events').EventEmitter

var helpers = require('./helpers')

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
        wrappedAPI[name] = function() {
          var meta = {
            remote: remote,
            connection: connection
          }
          var args = Array.prototype.slice.call(arguments, 0) // copy args
          var cb = args.pop()
          var errorFriendlyCallback = function() {
            var callbackArgs = self.serializeErrors(arguments)
            cb.apply(self, callbackArgs)
          }
          args.push(errorFriendlyCallback)
          args.push(meta)
          value.apply(this, args)
        }
      } else {
        wrappedAPI[name] = value
      }
    })
    _(this).extend(wrappedAPI)
    self.connections.push(connection)
    connection.once('end', function() {
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

Server.prototype.serializeErrors = function(args) {
  return helpers.serializeErrors(args, this.serializeError)
}

Server.prototype.serializeError = function(error) {
  return helpers.serializeError(error)
}

Server.prototype.shutdown = function(callback) {
  if (typeof callback !== 'function') callback = function(){}
  var self = this
  var end = function() {
    self.closed = true
    self.emit('shutdown')
    return callback()
  }
  if (this.closed) return end()
  if (!this.ready) {
    this.once('ready', function() {
      self.shutdown(callback)
    })
    return
  }
  this.dnode.once('close', function() {
    return end()
  })

  try {
    this.dnode.end()
    this.dnode.close()
  } catch(err) {
    if (err.message === 'Not running') {
      return end()
    } else {
      return callback(err)
    }
  }
  return this
}

module.exports = Server
