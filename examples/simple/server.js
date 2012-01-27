var enode = require('../../index')

var api = {
  whoami: function(callback) {
    console.log('server whoami')
    callback(null, "server")
  }
}

var server = new enode.server(api).listen(5000)

server.on('connect', function(remote, connection) {
  console.log('new connection', connection.id)
  remote.whoami(function(err, value) {
    console.log('server connected to', value)
  })
})
