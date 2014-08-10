## log-socket

tcp proxy socket that dumps everything through it to console.log - useful for debugging HTTP servers

## install

```
$ npm install log-socket
```

## usage

```js
var http = require('http')
var logsocket = require('logsocket')

var server = http.createServer(function(req, res){
	res.setHeader('x-test', 10)
	res.end('hello')
})

// redirect everything to this backend socket
var proxy = logsocket(8081, '127.0.0.1')

// Request data
proxy.on('input', function(chunk, enc){
	console.log(chunk.toString())	
})

// Response data
proxy.on('output', function(chunk, enc){
	console.log(chunk.toString())	
})

server.listen(8081)
proxy.listen(8080)
```

If you then curl to the logsocket - you will get a response from the backend HTTP server and the logsocket will dump all the traffic going through it

```
$ curl -L http://127.0.0.1:8080
```

## api

#### `var proxy = logsocket(port, [address])`

Return a tcp socket that will proxy traffic back to address:port - the default for address is '127.0.0.1'

## events

#### `proxy.on('input', function(chunk, enc){})`

Called when data is recieved by the socket

#### `proxy.on('output', function(chunk, enc){})`

Called when data is sent by the socket

## license

MIT