[![build status](https://secure.travis-ci.org/timoxley/enode.png)](http://travis-ci.org/timoxley/enode)
#eNode

eNode is a simple wrapper around [DNode](https://github.com/substack/dnode) and
[upnode](https://github.com/substack/upnode) functionality, simplifying 
creation and operation of DNode Servers and Clients. 

### Why 
I found that DNode used some confusing patterns and made certain operations complicated, 
so I wrapped them up in an 'easier' interface.

### Features and Differences from DNode

* eNode makes a sharp distinction between Clients and Servers.
* **Automatic buffering of requests and reconnections**. Upnode is configured 
  automatically between Servers and Clients.
* Servers & Clients don't fire callbacks/events until they recieve the remote's API.
* Unlike Dnode, you don't necessarily need to define the remote API inside the lexical 
  scope of the connection handler to gain access to the remote api and connection. 
  **All API calls get passed the remote API & connection**, as the final argument of each api call. 
* **Servers automatically keep a list of connected Clients** accessible
  as `server.connections`.
* **The `shutdown` function on Servers and Clients simplifies
  closing connections**. Using DNode, it is a multi-step dance to know when a connection is
  actually closed.
* DNode on 0.6.x doesn\'t serialize Error objects very usefully (it serializes them as `{}`). 
  eNode finds `Error` objects in your remote callback data, serializing them to a human readable format.
  You can override the `serializeError` method to expose more or less information.

## Usage

### Create a Server with an API
An API can be made up of Functions that take callbacks or  
Javascript primitive types e.g (Numbers, Strings, Plain Objects, Arrays)

As with DNode, properties on prototypes and return values are ignored.

```javascript

// Define an API for our Server


var api = {
  sendInfo: function(info, callback) {
    // do something with info
    callback(null, {data: 'Server got some info: ' + info}) // stupid api
  }
}

// Create Server with the supplied API
// and listen for client connections on port 3000
var server = new enode.Server(api).listen(3000) 

```

### Creating a Client and connecting to a Server

```javascript

// Connect to server running on port 3000
var client = enode.Client().connect(3000)

```

### Executing Server API methods from a Client

```javascript

// Execute remote method 'sendInfo' on Server
client.once('ready', function(server, connection) {
  // send info to the server via the api the server exposed
  server.sendInfo('Hello from client.', function(err, returnedData) {
    console.log(returnedData.data) 
    // Output: 'Server got some info: Hello from client.'
  })
})

// you can also access the server's methods via the client's `remote` property (once
the client has emit 'ready' or the connection() callback has run:
client.once('ready', function() {
  client.remote.sendInfo('Hello again from client!', function(err) {
    // etc
  })
})

```

### Creating a Client that exposes an API and connecting to a Server

```javascript

var client

// Create a client api
var api = {
  shutdown_client: function(callback) {
    client.shutdown(callback)
  }
}

client = enode.Client(api).connect(3000)

```

### Calling the Client's methods from a Server

```javascript

// 'connect' event is fired each time a Client connects
server.on('connect', function(clientAPI, connection) {
  // Call remote Client's `shutdown_client` method
  clientAPI.shutdown_client(function(err) {
    if (err) return console.log('error shutting down client: ' + connection.id)
    console.log('client shut down: ' + connection.id)
  })
})

```


### Shutting down Clients & Servers

```javascript

server.shutdown(function() {
  console.log('Callback: the server shutdown')
})

client.shutdown(function() {
  console.log('Callback: the client shutdown')
})

// 'shutdown' events will also fire
server.on('shutdown', function() {
  console.log('Event: the server shutdown')
})

client.on('shutdown', function() {
  console.log('Event: the client shutdown')
})


```

### Passing Errors

```javascript

// Create a Server with a `makeError` method
var server = new enode.Server({
  makeError: function(callback) {
    // send an error back to the client
    callback(new Error('oops'))
  }
}).listen(3000)

var client = new enode.Client().connect(3000, function(serverAPI) { 
  // this callback should receive the `Error` as a `String`
  serverAPI.makeError(function(err) {
    console.log(typeof err) // 'string'
    console.log(err) // Error: oops
    console.log('Error: oops' === err) // true
  })
})

```

## Example

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

* Implement/expose middleware
* More usage examples

## Contributors

[Tim Oxley](https://github/com/timoxley)

## Sponsor

[Groupdock](https://github.com/groupdock/) 
