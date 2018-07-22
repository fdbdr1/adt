const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 8080;

let workPackage = new Array();
let serverAdress = "";
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

app.post('/adp/deployOne/:id', (req, res) => {
    console.log('[POST] ' + req.url + '\t' + JSON.stringify(req.body));

    // let postData = querystring.stringify({
    //     'id': req.params.id
    // });

    let getReqOptions = {
        hostname: this.serverAdress,
        port: 8080,
        path: this.serverPath + "/" + req.params.id,
        method: 'GET',
        headers: {}
    }

    // console.log(JSON.stringify(getReqOptions));

    let getReq = http.request(getReqOptions, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('no more data in response.');
        });
    });

    getReq.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    getReq.end();

    res.send('Deploying ' + req.params.id + '...');
});

app.listen(PORT, () => {console.log(`listening on port ${PORT}...`)});