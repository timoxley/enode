var assert = require('assert')
describe('index', function() {
  var enode = require('../index')
  it('should expose server', function() {
    assert.equal(enode.Server, require('../lib/server'))
  })
  it('should expose client', function() {
    assert.equal(enode.Client, require('../lib/client'))
  })
})
