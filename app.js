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
    main(req,res);
});

function sendRequest(reqOptions, body) {
    return new Promise((resolve, reject) => {
        let req = http.request(reqOptions, (res) => {
            // console.log(`STATUS: ${res.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseobject = JSON.parse(chunk);
            });
            res.on('end', () => {
                resolve(responseobject);
            });
        });

        req.write(JSON.stringify(body));

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            reject(e);
        });
        req.end();
    });
}

async function main(req,res){
    let responseobject = new Object();

    let id = req.body.id;
    let body = {
        "id": id
    };
    let reqOptions = {
        hostname: this.serverAdress,
        port: 8081,
        path: '/cst/content',
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    };

    // Do the first request to get all related content for the resource
    responseobject = await sendRequest(reqOptions, body);

    let completeRessourceRelations = responseobject;
    let metaId = responseobject.metaId;
    let detailId = responseobject.detailId;

    // Prepare the Metadata request
    // set the body of the Metadata object request
    body = {
        "id": completeRessourceRelations.metaId
    }
    
    // Set the hostname, path and port of the metadata webservice
    reqOptions.hostname = this.serverAdress;
    reqOptions.path = '/cst/meta';
    reqOptions.port = 8081;

    // Do the Metadata request
    responseobject = await sendRequest(reqOptions, body);
    console.log('Metafile: ' + JSON.stringify(responseobject));

    // Prepare the Detail requests
    // set the body of the Detail object request
    body = {
        "id": null
    }

    // Set the hostname, path and port of the metadata webservice
    reqOptions.hostname = this.serverAdress;
    reqOptions.path = '/cst/detail';
    reqOptions.port = 8081;
    
    // Do the Detail requests
    while(completeRessourceRelations.detailId.length > 0){
        body.id = completeRessourceRelations.detailId.shift();
        responseobject = await sendRequest(reqOptions, body);
        console.log('Detailfile: ' + JSON.stringify(responseobject));
    }

    res.send('Deploying ' + req.body.id + '...');
}

app.listen(PORT, () => {console.log(`listening on port ${PORT}...`)});