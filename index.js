var EventEmitter = require('events').EventEmitter
var util = require('util')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')
var through = require('through2')

function DockerRun(address){
	EventEmitter.call(this)
	this.address = address
	if(this.address.indexOf('http')!=0){
		this.address = 'http://' + this.address
	}
}

util.inherits(DockerRun, EventEmitter)

module.exports = DockerRun

// the first create attempt that might work
DockerRun.prototype.proxy = function(req, done){
	var create = hyperquest(this.address + req.url, {
		method:req.method,
		headers:req.headers
	})

	var reqbody = ''
	create.on('response', function(createres){
		done(null, createres, reqbody)
	})

	create.on('error', done)

	req.pipe(through(function(chunk,enc,next){
		reqbody += chunk.toString()
		next()
	}))
	req.pipe(create)
}

DockerRun.prototype.handle = function(req, res){
	if(!req.url.match(/^(\/v\d+\.\d+)?\/containers\/create/)){
		res.statusCode = 500
		res.end('docker-run can only handle requests to /containers/create')
		return
	}
	this.proxy(req, function(err, backendres, reqbody){
		if(err){
			res.statusCode = 500
			res.end(err)
			return
		}

		// this is where we get busy
		if(backendres.statusCode==404){
			var container = JSON.parse(reqbody)
			console.dir(container)
			process.exit()
			res.statusCode = 500
			res.end('ok')
		}
		// yay - the image is there
		else{
			res.statusCode = backendres.statusCode
			res.headers = backendres.headers
			backendres.pipe(res)
		}
	})
}

module.exports = function(address){
	var proxy = new DockerRun(address)
	return proxy
}