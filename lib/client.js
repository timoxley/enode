var dnode = require('dnode')
var upnode = require('upnode')
var url = require('url')

var EventEmitter = require('events').EventEmitter

var Client = function(host, api, callback) {
  if (arguments.length === 2 && typeof api === 'function') {
    callback = api
    api = {}
  }
  var self = this
  this.api = api
  process.nextTick(function() {
    self.connect(host, callback)
  })
}

Client.prototype = new EventEmitter

Client.prototype.connect = function(host, callback) {
  if (typeof callback !== 'function') callback = function(){}
    
  this.up = upnode(function(remote, connection) {

  }).connect(host)
  var self = this
}


Client.prototype.shutdown = function(callback) {

  if (typeof callback !== 'function') callback = function(){}


}
module.exports = Client
