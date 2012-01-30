#eNode

eNode is a simple wrapper around DNode/upnode functionality, simplifying 
creation and operation of DNode servers and clients. I found that DNode
used some confusing patterns, so I wrapped them up in an 'easier'
interface, IMO.

### Features and Differences from DNode

* eNode makes a sharp distinction between Clients and Servers
* Automatic buffering of requests and reconnections on lost servers as provided
  by upnode is configured by default between Servers and Clients
* All 'connection' handling code is done in the 'connect' event, and
  unlike Dnode, the remote API will always be available in a `connect` event, 
  if it exists.
* Remote API calls get passed remote API & connection properties in a `meta` property 
  as the last argument passed to every API call. This means you don't necessarily need to
  define your API inside the scope of connection handler to get access to
  connection/remote objects.
* eNode servers automatically keep track of connections and disconnections, 
  accessible via the server's `connections` Array.
* The `shutdown` function will shut down both servers and clients, in
  DNode this was a multistep process which fired multiple events. eNode
  will fire 'shutdown'/return callback from `shutdown` when the connection
  is properly shut down.
* All operations take a callback which fires when ready, but also emits
  corresponding events. e.g. `shutdown()` will emit the 'shutdown' event,
  but can also take a callback.
* Using straight DNode on Node 0.6.x, if any of your remote calls callback with an `Error`
  the error arrive at the client as an empty object. eNode finds `Error`
  objects in the data you're returning in your callback, and calls
  toString on them so at least you have some idea of what the error was.
  If you want more information or a different serialisation method, you
  can simply override `serializeError` on eNode Clients and Servers.

## Usage

### Create a server with an API

```javascript

var api = {
  getSomeData: function(callback) {
    callback(null, {data: 'some data'})
  }
}

// create server and listen for connections on port 3000
var server = new enode.Server(api).listen(3000) 

```

### Creating a client to connect to a server

```javascript

// connect to server running on port 3000
var client = enode.Client().connect(3000)

```

### Executing remote commands from a server

```javascript

// execute 'getSomeData' from server

client.once('ready', function(remote, connection) {
  remote.getSomeData(function(err, returnedData) {
    console.log(returnedData.data) // 'some data'
  })
})


```

## Example

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
