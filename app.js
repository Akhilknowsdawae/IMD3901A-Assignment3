const express   = require('express');
const app       = express();
const http      = require('http');
const server    = require('http').createServer(app);  
const io        = require('socket.io')(server);

const LISTEN_PORT   = 8080;

// Helper: Generate a random 4-digit number (as a string)
function generateRandomNumber() {
    return '' + Math.floor(1000 + Math.random() * 9000);
}

// Shared game state: includes both numberGame (collaborative) and ticTacToe (competitive)
let gameState = {
    numberGame: { player1: '', player2: '', target: generateRandomNumber() },
    ticTacToe: { board: Array(9).fill(null), currentTurn: 'X' }
};

// Routes
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/public/index.html' );
});

app.get( '/2D', function( req, res ){ 
    res.sendFile( __dirname + '/public/2D.html' );
});

app.get( '/3D', function( req, res ){ 
    res.sendFile( __dirname + '/public/3D.html' );
});

// New route for collaborative game
app.get( '/collab', function( req, res ){
    res.sendFile( __dirname + '/public/collab.html' );
});

app.use(express.static(__dirname + '/public')); // Serve static files

// Socket.IO handling
io.on('connection', (socket) => {
    console.log(socket.id + " connected");
    console.log("Current gameState:", gameState);

    // Send the current state upon connection
    socket.emit('updateGameState', gameState);

    // Collaborative game event: process number input from one of the players
    socket.on('numberInput', ({ player, value }) => {
        console.log("numberInput event received for", player, "with value", value);
        gameState.numberGame[player] = value;

        // Check if both players have entered two digits and if the concatenated number matches the target
        if (gameState.numberGame.player1.length === 2 && gameState.numberGame.player2.length === 2 &&
            gameState.numberGame.player1 + gameState.numberGame.player2 === gameState.numberGame.target) {
            console.log("Correct number entered! Randomizing target.");
            gameState.numberGame.target = generateRandomNumber();
            // Optionally, clear the players' entries:
            // gameState.numberGame.player1 = '';
            // gameState.numberGame.player2 = '';
        }
        io.emit('updateGameState', gameState);
    });

    // Tic Tac Toe game event (unchanged)
    socket.on('ticTacToeMove', ({ index, player }) => {
        console.log("ticTacToeMove event received:", { index, player });
        console.log("Before move - Board:", gameState.ticTacToe.board, "CurrentTurn:", gameState.ticTacToe.currentTurn);
        if (gameState.ticTacToe.board[index] || gameState.ticTacToe.currentTurn !== player) {
            console.log("Invalid move: Either cell is occupied or it's not player", player + "'s turn.");
            return;
        }
        gameState.ticTacToe.board[index] = player;
        gameState.ticTacToe.currentTurn = player === 'X' ? 'O' : 'X';
        console.log("After move - Board:", gameState.ticTacToe.board, "CurrentTurn:", gameState.ticTacToe.currentTurn);
        io.emit('updateGameState', gameState);
    });

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
    });
});

server.listen(LISTEN_PORT, () => {
    console.log("Listening on port: " + LISTEN_PORT);
});
