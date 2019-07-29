class API {
    constructor(){};

    static exec(request, response) {
        request.chunks = [];
        request.on('data', (segment)=>request.chunks.push(segment));
        console.log("chunks: ", request.chunks)
        request.on('end', ()=>{

                const jsontype = "{ 'Content-Type': 'application/json' }";
                const content = JSON.stringify({success: true})
                response.writeHead(200, jsontype);
                response.end(content, 'utf-8');
        });

    }
}
module.exports = {API};

