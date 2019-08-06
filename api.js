const mysql = require('mysql');
const md5 = require('md5');

class database {
    constructor(){};

    static create(){
        let message = "Creating MySQL connection...";
        this.connection = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DBUSER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });
        this.connection.connect();
        console.log(message + 'ok.');

    }

}

function action_user_register(request, payload){
    return new Promise((resolve, reject)=>{
        if (!payload){
            reject('Oops no payload')
        };
        let q = `select * from user where username = '${payload.username}'`;
        database.connection.query(q, (error, results)=>{
            if (error) throw error;
            if (results.length !=0){
            resolve({'success':false, 'message': 'user ' + payload.username + " already exists"});
            } else {
                const password_md5 = md5(payload.password);
                const fields = `(username, password_md5)`;
                const values = `('${payload.username}', '${password_md5}')`;
                q = `insert into user ${fields} values ${values}`
                database.connection.query(q, (error, results)=>{
                    if (error) throw error;
                    
                    resolve({'success': true, 'message': `user "${payload.username}" registered.`});
                });
            };
        });
    });
};
function action_user_login(request, payload){
    return new Promise((resolve, reject)=>{
        if (!payload){
            reject("Oops no payload")
        };
        const q = `select * from user where username = '${payload.username}'`
        database.connection.query(q, (error, results)=>{
            if (error) throw error; 
            if (results.length != 0){
                if (md5(payload.password) == results[0].password_md5){
                    resolve({"success": true, 'message': `user "${results[0].username}" and password match.`});
                } else {
                    resolve({'success':false, 'message': `incorrect password or username.`});
                }
            };
        });
    }).catch((error) => { console.log("err:", error) });
};

function action_session_create(request, payload){
    function createAuthToken(){
        const token = md5((new Date).getTime().toString());
        return token;
    }
    return new Promise((resolve, reject)=>{
        if (!payload) reject("oops, no payload");
        let q = `select * from session where username = '${payload.username}' AND ip = '${request.connection.remoteAddress}' AND useragent = '${request.headers['user-agent']}'` ;
        database.connection.query(q, (error, results)=> {
            if(error) throw error;
            if(results[0]) {
                resolve({'success': true, 'token': results[0].token, 'message': "session found"});
            } else {
                const token = createAuthToken();
                const fields = `( username, token, ip, useragent)`;
                const values = `('${payload.username}', '${token}', '${request.connection.remoteAddress}', '${request.headers['user-agent']}')`;
                q = `insert into session ${fields} values ${values}`;
                database.connection.query(q, (error, results)=>{
                    if(error) throw error;
                    resolve({'success': true, 'token': token, 'message': "session created"});
                });
            }
        });
    }).catch((error) => { console.log("err:", error) });
};

function action_session_get(request, payload){
    return new Promise((resolve,reject)=>{
        if(!payload) reject("oops no payload");
        if(!payload.token) {
            resolve({userLoggedIn: false, message: 'No user logged in'});
        } else {
            let q = `select * from session where token = '${payload.token}'`;
            database.connection.query(q, (error, results) => {
                if (error) throw error;
                if(results.length === 0){
                    resolve({userLoggedIn: false, message: 'No user logged in'});
                } else {
                    resolve({userLoggedIn: true, user: results[0].username});
                }
            });
        }
    }).catch((error) => { console.log("err:", error) });;
}

function action_user_logout(request){
    console.log("logout");
    return new Promise((resolve,reject)=>{
        if(!request) throw "oops";
        const q = `Delete from session where ip = '${request.connection.remoteAddress}' AND useragent='${request.headers['user-agent']}'`;
        console.log(q);
        database.connection.query(q, (error, results)=>{
            if (error) throw error;
            console.log("res: ", results);
            resolve({success: true, message: "user logged out"})
        })
    }).catch((error) => { console.log("err:", error) });
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
        request.chunks = [];
        request.on('data', segment => {
                request.chunks.push(segment);
        });
        request.on('end', ()=>{
            console.log("API.parts: ", API.parts);
            let payload;
            request.chunks.length>0? payload = JSON.parse(Buffer.concat(request.chunks).toString()) : null;
            if (identify('user', 'login')){
                if(payload.token){//check if already logged in
                    action_session_get(request, payload).
                    then(content => {
                        console.log("153: ",content)
                        if(content.userLoggedIn){
                            respond(response, {success: false, message:`user ${content.user} already logged in`});
                            return;
                        }
                    });
                };
                action_user_login(request, payload )
                .then(content => { //not dry 1
                    console.log(payload);
                    if(content.success == true){
                        return action_session_create(request, payload);
                    }
                    return content
                })
                .then(content=>{
                    respond(response, content)});
            }
            if (identify('user', 'register')){
                action_user_register(request, payload)
                .then(content => { //not dry 1
                    if(content.success == true){
                        return action_session_create(request, payload);
                    }
                    return content
                })
                .then(content => {
                    respond(response, content)
                });
            }

            if (identify('user', 'logout')){
                action_user_logout(request)
                .then(content => {
                    respond(response, content)
                })
            }
            if (identify('session', 'get')){
                action_session_get(request, payload)
                .then(content => {
                    respond(response,content)
                });
            }
        });
    };
    static catchAPIRequest(url){
        console.log("url:",url);
        if (url[0] === '/') url = url.substring(1, url.length);
        if (url.split('/')[0]=='api'){
            API.parts = url.split('/');
            return true;
        }
        return false;
    }
}

API.parts = null;
module.exports = {API, database};

