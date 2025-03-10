// collab.js

const socket = io();
console.log("Socket initialized in 3D Collaborative Game.");

// Prompt user for their player number (1 or 2)
let playerRole = prompt("Enter your player number (1 or 2):");
if (playerRole !== "1" && playerRole !== "2") {
    alert("Invalid player number. Defaulting to Player 1.");
    playerRole = "1";
}
// For this puzzle: 
// - Player1 is responsible for the first two digits (which they do not see)
// - Player2 is responsible for the last two digits (which they do not see)
const playerKey = playerRole === "1" ? "player1" : "player2";
console.log("Player assigned as", playerKey);

// Local state to track this user's input (2 digits max)
let localInput = "";

// Create a digit pad (digits 0-9 arranged in two rows of five)
const digitPad = document.getElementById('digit-pad');
const digitPadConfig = [
    { digit: '0', row: 0, col: 0 },
    { digit: '1', row: 0, col: 1 },
    { digit: '2', row: 0, col: 2 },
    { digit: '3', row: 0, col: 3 },
    { digit: '4', row: 0, col: 4 },
    { digit: '5', row: 1, col: 0 },
    { digit: '6', row: 1, col: 1 },
    { digit: '7', row: 1, col: 2 },
    { digit: '8', row: 1, col: 3 },
    { digit: '9', row: 1, col: 4 }
];

const cellWidth = 0.8;
const cellSpacing = 0.2;
// Calculate total width for 5 digits to center the pad
const totalWidth = 5 * cellWidth + 4 * cellSpacing;
const startX = -totalWidth / 2 + cellWidth / 2;

digitPadConfig.forEach(config => {
    const digitEntity = document.createElement('a-box');
    digitEntity.setAttribute('width', cellWidth);
    digitEntity.setAttribute('height', cellWidth);
    digitEntity.setAttribute('depth', 0.2);
    digitEntity.setAttribute('color', '#888');
    digitEntity.setAttribute('class', 'clickable');
    // Position: two rows (row 0 at top, row 1 at bottom)
    const posX = startX + config.col * (cellWidth + cellSpacing);
    const posY = config.row === 0 ? cellWidth / 2 + cellSpacing / 2 : -cellWidth / 2 - cellSpacing / 2;
    digitEntity.setAttribute('position', `${posX} ${posY} 0`);

    // Add a text label showing the digit
    const digitText = document.createElement('a-text');
    digitText.setAttribute('value', config.digit);
    digitText.setAttribute('align', 'center');
    digitText.setAttribute('color', '#FFF');
    digitText.setAttribute('position', '0 0 0.3');
    digitText.setAttribute('width', '2');
    digitEntity.appendChild(digitText);

    // On click, append the digit to local input (if less than 2 digits)
    digitEntity.addEventListener('click', function() {
        console.log("Digit clicked:", config.digit);
        if (localInput.length < 2) {
            localInput += config.digit;
            console.log("Updated local input:", localInput);
            updatePlayerDisplay();
        }
    });
    digitPad.appendChild(digitEntity);
});

// Clear button: resets local input
document.getElementById('clear-btn').addEventListener('click', function() {
    console.log("Clear button clicked.");
    localInput = "";
    updatePlayerDisplay();
});

// Submit button: sends the player's two-digit input to the server
document.getElementById('submit-btn').addEventListener('click', function() {
    console.log("Submit button clicked with local input:", localInput);
    if (localInput.length !== 2) {
        alert("Please enter exactly two digits before submitting.");
        return;
    }
    socket.emit("numberInput", { player: playerKey, value: localInput });
    // Optionally clear local input after submitting
    localInput = "";
    updatePlayerDisplay();
});

// Update the on-screen display for the player's input
function updatePlayerDisplay() {
    const playerTextEl = document.getElementById('player-text');
    playerTextEl.setAttribute('value', "Your Input: " + localInput);
}

// Listen for game state updates from the server
socket.on("updateGameState", (gameState) => {
    console.log("Received updateGameState:", gameState);
    // The full target is stored on the server as a 4-digit string.
    let target = gameState.numberGame.target;
    let maskedTarget = "";
    if (target.length < 4) {
        // If target is not ready, show placeholder.
        maskedTarget = "XXXX";
    } else {
        if (playerKey === "player1") {
            // Player1 sees: mask first two digits, show last two.
            maskedTarget = "XX" + target.substr(2, 2);
        } else {
            // Player2 sees: show first two digits, mask last two.
            maskedTarget = target.substr(0, 2) + "XX";
        }
    }
    const targetDisplayEl = document.getElementById('target-display').children[0];
    targetDisplayEl.setAttribute('value', "Target: " + maskedTarget);

    // Determine the opponent key and update the corresponding display
    const opponentKey = playerKey === "player1" ? "player2" : "player1";
    const opponentDisplayEl = document.getElementById('opponent-text');
    opponentDisplayEl.setAttribute('value', "Other Input: " + gameState.numberGame[opponentKey]);
});

socket.on("connect", () => {
    console.log("Connected to socket server from Collaborative Game.");
});
