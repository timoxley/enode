#eNode

eNode is a simple wrapper around DNode/upnode functionality, simplifying creation and operation of DNode servers and clients. I like DNode, I just found it used some strange patterns.

### Features and Differences from DNode

* eNode automatically uses upnode's buffering/reconnecting functionality for 'clients'.
* All operations take a callback which fires when ready, but also emit corresponding events.
* The `shutdown` function will shut down both servers and clients
  (servers normally require a `close()` and an `end()` while a client normally just needs a close(). 
* All 'connection' handling code is done in the 'connect' event for
  servers, unlike DNode/upnode where you can set callbacks with the
DNode/upnode() function, as well as on 'ready' 'remote' 'connection'.
* Remote API calls get passed the remote/connection properties so they don't necessarily need to be defined inside the scope of connection handler.
* eNode servers automatically keep track of connections and
  disconnections, accessible via the server's `connections` Array.

## Usage

### Server

```javascript
// server.js
var enode = require('enode')

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

```

### Client

```javascript
// client.js
var enode = require('enode')

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

```


