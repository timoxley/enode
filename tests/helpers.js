var helpers = require('../lib/helpers')
var assert = require('assert')

describe('helpers', function() {
  describe('serialiseErrors', function() {
    it('should serialise Error objects found in array', function() {
      var args = [1, 2, new Error('success')]
      var result = helpers.serializeErrors(args)
      assert.deepEqual(result, [1, 2, 'Error: success'])
    })
  })
})
