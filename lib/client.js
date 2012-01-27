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
        wrappedAPI[name] = function() {
          var meta = {
            remote: remote,
            connection: connection
          }
          var args = Array.prototype.splice.call(arguments, 0) // copy args
          args.push(meta)
          value.apply(this, args)
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
  
  if (!this.up.closed && self.connection != null) {
    self.up.close()
    if (!self.up.conn) {
      self.emit('shutdown')
      return callback()
    } else {
      self.connection.once('end', function() {
        self.emit('shutdown')
        return callback()
      })
    }

  } else {
    self.emit('shutdown')
    callback()
  }
}

module.exports = Client
