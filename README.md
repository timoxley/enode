#eNode

eNode is a simple wrapper around DNode/upnode functionality, simplifying 
creation and operation of DNode servers and clients. I found that DNode
used some confusing patterns, so I wrapped them up in an 'easier'
interface, IMO.

### Features and Differences from DNode

* eNode makes a sharp distinction between Clients and Servers
* Upnode's buffering/reconnecting functionality is set up automatically for
 Clients.
* All 'connection' handling code is done in the 'connect' event, and the
  remote api will always be present, if available.
* Remote API calls get passed remote and connection properties so they don't 
necessarily need to be defined inside the scope of connection handler.
* eNode servers automatically keep track of connections and disconnections, 
accessible via the server's `connections` Array.
* The `shutdown` function will shut down both servers and clients.
* All operations take a callback which fires when ready, but also emits
 corresponding events. e.g. `shutdown()` will emit the 'shutdown' event,
but can also take a callback.

## Usage

### Server

```javascript
// server.js
var enode = require('enode')

var api = {
  whoami: function(callback, meta) {
    callback(null, "server " + meta.connection.id))
  }
}

var server = new enode.Server(api).listen(5000)

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
  whoami: function(callback, meta) {
    callback(null, "client " + meta.connection.id)
  }
}

var client = new enode.Client(api).connect(5000)

client.on('ready', function(remote) {
  remote.whoami(function(err, value) {
    console.log('client connected to', value)
  })
})

```

##Todo

* Implement middleware
* More usage examples

## Contributors

[Tim Oxley](https://github/com/timoxley)

## Sponsor

[Groupdock](https://github.com/groupdock/) 
