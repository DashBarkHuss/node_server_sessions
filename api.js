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
                console.log(37, q);
                database.connection.query(q, (error, results)=>{
                    if (error) throw error;
                    resolve({'success': true, 'message': `user "${payload.username}" registered.`})
                })

            }
        })
    })
}
function action_user_login(request, payload){
    return new Promise((resolve, reject)=>{
        if (!payload){
            reject("Oops no payload")
        };
        const q = `select * from user where username = '${payload.username}'`
        database.connection.query(q, (error, results)=>{
            if (error) throw error; 
            if (results.length != 0){
                console.log("results: ", results)
                resolve({"success": true});
            }
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
            const payload = JSON.parse(Buffer.concat(request.chunks).toString());
            console.log('58 payload: ', payload);
            if (identify('user', 'login')){
                action_user_login(request, payload )
                .then(content=>{
                    respond(response, content)});
            }
            if (identify('user', 'register')){
                action_user_register(request, payload)
                .then(content => {
                    respond(response, content)
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

