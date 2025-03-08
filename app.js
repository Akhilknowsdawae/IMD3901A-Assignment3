const express   = require('express');
const app       = express();
const http      = require('http');
const server    = require('http').createServer(app);  
const io        = require('socket.io')(server);

const LISTEN_PORT   = 8080;

//our routes
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/public/index.html' );
});

app.get( '/2D', function( req, res ){ 
    res.sendFile( __dirname + '/public/2D.html' );
});

app.get( '/3D', function( req, res ){ 
    res.sendFile( __dirname + '/public/3D.html' );
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
io.on('connection', (socket) => {
    console.log( socket.id + " connected" );

    socket.on('disconnect', () => {
        console.log( socket.id + " disconnected" );
    });

    socket.on("red", (data) => {
        console.log( "red event received" );
        io.emit("color_change", {r:255, g:0, b:0});         //to all connected clients
        //io.socket.emit("color_change", {r:255, g:0, b:0});  //to everyone but sender
    });

    socket.on("blue", (data) => {
        console.log( "blue event received" );
        io.emit("color_change", {r:0, g:0, b:255});
    });

    //question 1: how do you continuously update the network, e.g., users position and orientation?
    //question 2: how do you synch clients to current state?
});

app.use(express.static(__dirname + '/public')); //set root path of server ...
server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT );