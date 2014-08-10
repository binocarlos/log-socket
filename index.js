var net = require('net')
var through = require('through2')

module.exports = function(port, address){

	if(!port){
		throw new Error('port required for new log socket')
	}

	address = address || '127.0.0.1'
	
	var tcpproxy = net.createServer(function (socket) {
	  var serviceSocket = new net.Socket();
	  serviceSocket.connect(port, address, function () {
	    socket.pipe(through(function(chunk,enc,next){
	    	tcpproxy.emit('input', chunk, enc)
	      this.push(chunk)
	      next()
	    })).pipe(serviceSocket).pipe(through(function(chunk,enc,next){
	    	tcpproxy.emit('output', chunk, enc)
	      this.push(chunk)
	      next()
	    })).pipe(socket)
	  })
	  serviceSocket.on('error', function(){
	  	socket.close()
	  })
	})

  return tcpproxy
}