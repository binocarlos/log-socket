var http = require('http')
var logsocket = require('logsocket')

var server = http.createServer(function(req, res){
	res.setHeader('x-test', 10)
	res.end('hello')
})

// redirect everything to this backend socket
var proxy = logsocket('127.0.0.1', 8081)

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