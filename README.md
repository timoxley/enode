#enode

enode Host is a simple wrapper around dnode/upnode functionality, simplifying creation and operation of dnode clients and hosts.

Clients will automatically buffer commands and reconnect if the host
goes down.

Clients and Hosts can be shut down permanently with `shutdown()`
command.

All you need to do is supply your host and client API's and you're set. 


### Host

```javascript

require('dhost').host

var api = {
  getUser: function(callback, connection) {
    callback()
  }
}

var host = new DHost(5000, api)

host.on('connection', function(remote, connection) {
  
}) 
```

### Client

```javascript

var dclient = require('dhost').client

var client = new DClient(5000)

client.on('ready', function(remote, connection) {
  remote.getUser(function(callback, connection) {
    
  })
})

```
