var enode = require('../../index')

var api = {
  whoami: function(callback, remote, connection) {
    callback(null, "client. connection id: " + connection.id)
  }
}

var client = new enode.Client(api).connect(5000)

client.on('ready', function(remote) {
  remote.whoami(function(err, value) {
    console.log('client connected to', value)
  })
})
