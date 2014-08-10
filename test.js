var logsocket = require('./')
var http = require('http')
var hyperquest = require('hyperquest')
var tape = require('tape')

var server = null
var proxy = null
function startServers(done){
  server = http.createServer(function(req, res){
    res.setHeader('x-test', 10)
    res.end('hello')
  })

  // redirect everything to this backend socket
  proxy = logsocket('127.0.0.1', 8081)

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

})

tape('stop servers', function(t){
  stopServers(function(){
    t.end()
  })
})