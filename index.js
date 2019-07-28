const http = require('http');
const fs = require('fs');


const ip = '127.0.0.1';
const port = 3000;


http.createServer((request, response)=>{
    console.log('request: ', request.url);
    let file;
    if (request.url === '/') file = 'index.html'
    else file = request.url.slice(1, request.url.length);
    fs.readFile(file, function(error,content){
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end(content, 'utf-8'); 
    });

}).listen(port,ip);