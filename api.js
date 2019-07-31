function action_user_login(request, payload){
    console.log("login");
    return new Promise((resolve, reject)=>{
        if (!payload){
            reject("Oops no payload")
        };
        resolve({"success": true}); 
    }).catch((error) => { console.log("err:", error) });
}
function respond(response, content){
    const jsontype = "{ 'Content-Type': 'application/json' }";
    content = JSON.stringify(content);
    console.log("cont:", content);
    response.writeHead(200, jsontype);
    response.end(content, 'utf-8');
}
function identify(a,b){
    if (API.parts[1] === a && API.parts[2] === b) return true;
    return false;
}

class API {
    constructor(){};

    static exec(request, response) {
        request.chunks = [];
        request.on('data', segment => {
                request.chunks.push(segment);
        });
        request.on('end', ()=>{
            console.log("API.parts: ", API.parts);
            const payload = JSON.parse(Buffer.concat(request.chunks).toString());
            console.log('payload: ', payload);
            if (identify('user', 'login')){
                action_user_login(request, payload )
                .then(content=>{
                    respond(response, content)});
            }
        });
    };
    static catchAPIRequest(url){
        console.log("url:",url);
        if (url[0] === '/') url = url.substring(1, url.length);
        if (url.split('/')[0]='api'){
            API.parts = url.split('/');
            return true;
        }
        return false;
    }
}

API.parts = null;
module.exports = {API};

