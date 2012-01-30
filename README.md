#eNode

eNode is a simple wrapper around [DNode](https://github.com/substack/dnode) and
[upnode](https://github.com/substack/upnode) functionality, simplifying 
creation and operation of DNode Servers and Clients. 

### Why 
I found that DNode used some confusing patterns and made certain operations complicated, 
so I wrapped them up in an 'easier' interface.

### Features and Differences from DNode

* eNode makes a sharp distinction between Clients and Servers
* **Automatic buffering of requests and reconnections** on lost servers as provided
  by upnode is configured by default between Servers and Clients
* All 'connection' handling code is done in the 'connect' event, and
  unlike Dnode, the Servers/Clients don't return fire any callbacks/events 
  until they have recieved the remote's API 
* **Each API call gets passed remote API & connection properties** in a `meta` property 
  (as the last argument). This means you don't necessarily need to
  define your API inside the scope of connection handlers to get access to
  connection/remote objects.
* **Servers automatically keep a list of connected Clients.**.
  This is accessible via the server's `connections` Array.
* **The `shutdown` function on both Servers and Clients simplifies
  closing down a connection**.
  Using DNode this was a multistep, strange danceto know when a connection was
  actually closed.
* To get around a 'bug' in DNode on 0.6.x, eNode finds `Error` objects in the data you're returning
  in your remote callback, and uses  `err.toString()` to convert the Error into a String 
  format like: 'Error: Some error occurred'.
  If you want to transmit more information about Errors, you can provide a different
  serialisation method by simply overriding `serializeError` on eNode Clients & Servers.

## Usage

### Create a Server with an API

```javascript

var api = {
  sendInfo: function(info, callback) {
    // do something with info
    callback(null, {data: 'got some info: ' + info}) // stupid api
  }
}

// create Server with  the supplied API
// and listen for connections on port 3000
var server = new enode.Server(api).listen(3000) 

```

### Creating a Client and connecting to a Server

```javascript

// connect to server running on port 3000
var client = enode.Client().connect(3000)

```

### Executing Server API methods from a Client

```javascript

// execute remote method 'getSomeData' from Server
client.once('ready', function(serverAPI, connection) {
  var info = 'bovine'
  serverAPI.sendInfo(info, function(err, returnedData) {
    console.log(returnedData.data) // 'got some info: bovine'
  })
})
```

### Creating a Client with an API and connecting to a Server

```javascript

var client
var api = {
  shutdown: client.shutdown(callback)
}

// Clients can have API's too
client = enode.Client(api).connect(3000)

```

### Calling a Client API from a Server

```javascript

server.on('connect', function(clientAPI, connection) {
  // call remote Client's `shutdown` method
  clientAPI.shutdown(function(err) {
    if (err) return console.log('error shutting down client: ' + connection.id)
    console.log('client shut down: ' + connection.id)
  })
})

```


### Shutting down a Server/Client

```javascript

server.shutdown(function() {
  console.log('Callback: the server shutdown')
})

// or alternatively

server.on('shutdown', function() {
  console.log('Event: the server shutdown')
})

client.shutdown(function() {
  console.log('Callback: the client shutdown')
})

// shutdown event should execute around same time as shutdown callback is run
client.on('shutdown', function() {
  console.log('Event: the client shutdown')
})

```

### Returning Errors

```javascript

// alternative definition format
var server = new enode.Server({
  makeError: function(callback) {
    callback(new Error('oops'))
  }
}).listen(3000)

var client = new enode.Client().connect(3000, function(serverAPI) { 
  // this connect() callback fires when client is connected 
  serverAPI.makeError(function(err) {
    console.log(typeof err) // 'string'
    console.log(err) // Error: oops
    console.log('Error: oops' === err) // true
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
