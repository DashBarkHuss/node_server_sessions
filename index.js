const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch');
const {API} = require('./api');


const ip = '127.0.0.1';
const port = 3000;


http.createServer((request, response)=>{
    console.log('request: ', request.url);
    let file;
    if (request.url === '/') file = 'index.html'
    else file = request.url.slice(1, request.url.length);
    fs.readFile(file, function(error,content){
        if (error){
            if (error='ENOENT'){
                let req;
                if (request.url[0] == '/') req = request.url.substring(1, request.length);
                if (req.split('/')[0]=='api') {
                    console.log("api request");
                    API.exec(request, response);
                }
                else {
                    fs.readFile('404.html', function(error,content){
                        response.writeHead('200', {'Content-Type':'text/html'});
                        response.end(content, 'utf-8')
                    });
                }
            }
            else {
                console.log("error 500");
                response.writeHead(500);
                response.end('Error ' + error.code + '\n');
            }
        }
        else {
            console.log("200");
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.end(content, 'utf-8'); 
        }
    });
}).listen(port,ip);

fetch('http://127.0.0.1:3000/api/lol').then(promise=>{
    console.log("response: ", promise);
    const json = promise.json();
    console.log(".json(): ", json)
    return json;
});