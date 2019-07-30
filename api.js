function action_user_login(){
    console.log("login");
}
function respond(response, content){
    const jsontype = "{ 'Content-Type': 'application/json' }";
    content = JSON.stringify(content);
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
        request.on('data', ()=>{});
        request.on('end', ()=>{
            console.log("API.parts: ", API.parts);

            if (identify('user', 'login')){
                action_user_login();
            };
            respond(response, {success: true});
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

