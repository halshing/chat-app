require('dotenv').config();
const port = process.env.PORT || 3000;

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const db = require('./db');

let database = new db();
let connections = [];
let JsonDB = [];

let sendToConnectedClients = data => {
    connections.forEach(socket => {
        socket.send(JSON.stringify(data));
    });
}

app.use(express.static('public'));

app.ws('/', (ws, req) => {
    let clientIP = req.connection.remoteAddress;
    clientIP = clientIP.substring(clientIP.lastIndexOf(':') + 1, clientIP.length);
    
    // Add the current connection to the tracker
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
        data.IPAddress = clientIP;
        // Update JsonDB
        JsonDB.push(data);
        // Update database
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});