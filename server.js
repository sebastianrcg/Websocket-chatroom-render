///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const http = require('http'); 
const CONSTANTS = require('./utils/constants.js');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// You may choose to use the constants defined in the file below
const { PORT, CLIENT } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  const filePath = (req.url === '/') ? '/public/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);

  fs.exists(fullPath, (exists) => {
    if (!exists) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const extname = path.extname(fullPath);
    let contentType = 'text/html';
    if (extname === '.js') contentType = 'text/javascript';
    else if (extname === '.css') contentType = 'text/css';
    else if (extname === '.ico') contentType = 'image/x-icon';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(fullPath).pipe(res);
  });
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// TODO
// Exercise 3: Create the WebSocket Server using the HTTP server
const wsServer = new WebSocket.Server({
  server: server
});

// TODO
// Exercise 5: Respond to connection events 

wsServer.on('connection', (socket) => {
  console.log('New Connection!');

  const data = {
    type: "JOIN_ROOM", 
    payload: { message: "Welcome to the Chatroom!"}
  }

  socket.send(JSON.stringify(data));

  socket.on("message", (data)=> {
    const { type, payload} = JSON.parse(data);
    
    if (type === "NEW_USER"){
      socket.username = payload.username;
    }

    // console.log(data);
    broadcast(data, socket);
    // socket.send("Message received: " + data);
  })

  socket.on("close", ()=> {
    
    const data = {
      type: "LEAVING",
      payload: { username: socket.username}
    }
    broadcast(JSON.stringify(data));
  })
} )
  // Exercise 6: Respond to client messages
  // Exercise 7: Send a message back to the client, echoing the message received
  // Exercise 8: Broadcast messages received to all other clients
  

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  // TODO
  // Exercise 8: Implement the broadcast pattern. Exclude the emitting socket!
  wsServer.clients.forEach(connectedClient => {
      if (connectedClient.readyState === WebSocket.OPEN && connectedClient !== socketToOmit){
        connectedClient.send(data)
      }
    })
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});

