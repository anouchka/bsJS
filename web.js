var bs = require('./bs/bsnode');
bs.$route( require('./noderoot/lab/route').route );
/*
var http = require("http");
http.createServer(function(request, response) {
response.writeHead(200, {"Content-Type": "text/html"});
response.write("Hello, World~!!");
response.end();
}).listen(8001);
*/