'use strict'

var util = require('util')

exports.serializeErrors = function(args, serializeError) {
  // ensure args is always an array (e.g. convert arguments objects)
  var arrayArgs = Array.prototype.slice.call(args, 0)
  serializeError = serializeError || exports.serializeError
  return arrayArgs.map(function(item) {
    if (util.isError(item)) return serializeError(item)
    return item
  })
}

exports.serializeError = function(error) {
  return error.toString()
}

