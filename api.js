function respond(response, content){
    const jsontype = "{ 'Content-Type': 'application/json' }";
    content = JSON.stringify(content);
    response.writeHead(200, jsontype);
    response.end(content, 'utf-8');
}

class API {
    constructor(){};

    static exec(request, response) {
        request.chunks = [];
        request.on('data', (segment)=>request.chunks.push(segment));
        request.on('end', ()=>{
            console.log("API.parts: ", API.parts);
            respond(response, {success: true});
        });

    }
    static catchAPIRequest(url){
        console.log(url);
        if (url[0] === '/') url = url.substring(1, url.length);
        if (url.split('/')[0]='api'){
            API.parts = url.split('/');
            return true;
        }
    }
}

API.parts = null;
module.exports = {API};

