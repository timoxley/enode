var enode = require('../../index')

var api = {
  whoami: function(callback) {
    callback(null, "server")
  }
}

var server = new enode.server(api).listen(5000)

server.on('connect', function(remote, connection) {
  console.log('new connection', connection.id)
  remote.whoami(function(err, value) {
    console.log('server connected to', value)
  })
  console.log('connected clients', server.connections.length)
})
server.on('disconnect', function(connection) {
  console.log('disconnection', connection.id)
  console.log('connected clients', server.connections.length)
})
