var enode = require('../../index')

var api = {
  whoami: function(callback) {
    callback(null, "client")
  }
}

var client = new enode.client(api).connect(5000)

client.on('ready', function(remote) {
  remote.whoami(function(err, value) {
    console.log('client connected to', value)
  })
})
