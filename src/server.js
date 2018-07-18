const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const _db = require('./db');
const database = new _db('chat_db.json');

let connections = [];
let JsonDB = [];

let sendToConnectedClients = data => {
    connections.forEach(socket => {
        socket.send(JSON.stringify(data));
    });
}

app.use(express.static('public'));

app.ws('/', (ws, req) => {
    console.log(ws);  
    // Add the current connection to our tracker
    connections.push(ws);

    database.getChats()
        .then(result => {
            if (result) {
                result = JSON.parse(result);
                ws.send(JSON.stringify({
                    messages: result,
                    wsOn: true
                }));
                JsonDB = result;
            }
        })
        .catch(err => {});

    ws.on('message', data => {
        data = JSON.parse(data);
        // Update JsonDB
        JsonDB.push(data);
        // Update our database
        database.update(JsonDB);
        // Let everyone else know
        sendToConnectedClients(JsonDB);
    });
    ws.on('close', function () {
        // Remove the connection from our tracker
        connections = connections.filter(conn => {
            return (conn === ws) ? false : true;
        });
    });
});

app.listen('9486', () => {
    console.log('Server running...');
});