var logsocket = require('./')
var http = require('http')
var hyperquest = require('hyperquest')
var tape = require('tape')
var concat = require('concat-stream')

var server = null
var proxy = null
var results = {
  input:'',
  output:''
}
function startServers(done){
  server = http.createServer(function(req, res){
    res.setHeader('x-test', 10)
    res.end('hello')
  })

  // redirect everything to this backend socket
  proxy = logsocket(8081, '127.0.0.1')

  // Request data
  proxy.on('input', function(chunk, enc){
    results.input += (chunk || '').toString()
  })

  // Response data
  proxy.on('output', function(chunk, enc){
    results.output += (chunk || '').toString()
  })

  server.listen(8081)
  proxy.listen(8080)
  done()
}

function stopServers(done){
  server.close()
  proxy.close()
  done()
}

tape('start servers', function(t){
  startServers(function(){
    setTimeout(function(){
      t.end()  
    }, 100)
  })
})

tape('capture taffic going through the logsocket', function(t){
  var req = hyperquest('http://127.0.0.1:8080/hello')

  req.on('response', function(res){
    t.equal(res.statusCode, 200, '200 status')
    
  })

  req.pipe(concat(function(answer){

    t.equal(answer.toString(), 'hello', 'body intact')
    var inputs = results.input.split(/\r?\n/g)
    var outputs = results.output.split(/\r?\n/g)

    t.equal(inputs[0], 'GET /hello HTTP/1.1', 'inputs 1')
    t.equal(inputs[1], 'Host: 127.0.0.1:8080', 'inputs 2')
    t.equal(outputs[0], 'HTTP/1.1 200 OK', 'outputs 1')
    t.equal(outputs[1], 'x-test: 10', 'outputs 2')

    t.end()
    
  }))
})

tape('stop servers', function(t){
  stopServers(function(){
    t.end()
  })
})