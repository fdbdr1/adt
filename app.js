const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 8080;

let workPackage = new Array();
let serverAdress = "localhost";
let serverPath = "";

const app = express();
app.use(bodyParser.json());
app.set({'json escape': true});

app.post('/adp/setServer', (req, res) => {
    console.log('[POST] ' + req.url + '\t' + JSON.stringify(req.body));
    try{
        if(!req.body.url){throw(new Error('server url not defined'));}
        this.serverAdress = req.body.url;
        let responsetext = 'new Server adress: ' + this.serverAdress;
        console.log(responsetext);
        res.send(responsetext);
    }
    catch(e){
        console.log(e.message);
        res.send("Error");
    }
});

app.post('/adp/setPath', (req, res) => {
    console.log('[POST] ' + req.url + '\t' + JSON.stringify(req.body));
    try{
        if(!req.body.path){throw(new Error('path not defined'));}
        this.serverPath = req.body.path;
        let responsetext = 'new Server path: ' + this.serverPath;
        console.log(responsetext);
        res.send(responsetext);
    }
    catch(e){
        console.log(e.message);
        res.send("Error");
    }
});

app.post('/adp/deployOne', (req, res) => {
    console.log('[POST] ' + req.url + '\t' + JSON.stringify(req.body));

    // let postData = querystring.stringify({
    //     'id': req.params.id
    // });

    let responseobject = new Object();
    function sendRequest(getReqOptions, id) {
        return new Promise((resolve, reject) => {
            let getReq = http.request(getReqOptions, (res) => {
                // console.log(`STATUS: ${res.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    // console.log(`BODY: ${chunk}`);
                    responseobject = JSON.parse(chunk);
                });
                res.on('end', () => {
                    // console.log('no more data in response.');
                    resolve(responseobject);
                });
            });

            getReq.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                reject();
            });
            getReq.end(JSON.stringify({'id': id}));
        });
    }

    async function main(){
        let id = req.body.id;
        let getReqOptions = {
            hostname: this.serverAdress,
            port: 8081,
            path: '/cst/content',
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }
        };
    
        // console.log(JSON.stringify(getReqOptions));
        responseobject = await sendRequest(getReqOptions, id);
        console.log('Content Object: ' + JSON.stringify(responseobject));

        metaId = responseobject.metaId;
        detailId = responseobject.detailId;

        id = metaId;
        // console.log(id);

        getReqOptions.path = '/cst/meta';
    
        // console.log(JSON.stringify(getReqOptions));
        responseobject = await sendRequest(getReqOptions, id);
        console.log('Metafile: ' + JSON.stringify(responseobject));

        getReqOptions.path = '/cst/detail';
        
        while(detailId.length > 0){
            id = detailId.shift();
            responseobject = await sendRequest(getReqOptions, id);
            console.log('Detailfile: ' + JSON.stringify(responseobject));
        }
        // detailId.forEach(element => {
        //     id = element;
        //     // console.log(id);
        //     responseobject = sendRequest(getReqOptions, id);
        //     console.log(responseobject);
        // });

        res.send('Deploying ' + req.body.id + '...');
    }
    main();
});

app.listen(PORT, () => {console.log(`listening on port ${PORT}...`)});