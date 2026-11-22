
// TWISTOPIA - Number Twist
// Level 1: 3 x 3

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const board = document.createElement("div");
board.id = "game-board";
board.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 80px);
    gap: 6px;
    justify-content: center;
    margin: 30px auto 20px;
`;

document.body.appendChild(board);

let selected = 0;
let moves = 0;

const status = document.createElement("p");
document.body.appendChild(status);


const completionMessage = document.createElement("p");

completionMessage.style.cssText = `
    margin: 20px;
    color: #06d6a0;
    font-size: 22px;
    font-weight: bold;
`;

document.body.appendChild(completionMessage);

const winPopup = document.createElement("div");

winPopup.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

const popupContent = document.createElement("div");

popupContent.style.cssText = `
    background: white;
    color: #25204f;
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    width: 85%;
    max-width: 350px;
`;

popupContent.innerHTML = `
    <div style="font-size: 45px;">🏆</div>
    <h2>Congratulations!</h2>
    <p style="margin: 15px 0;">Puzzle Completed!</p>
    <p id="final-moves"></p>
`;

const playAgainButton = document.createElement("button");

playAgainButton.textContent = "🎮 Play Again";

playAgainButton.style.cssText = `
    margin-top: 20px;
    padding: 12px 25px;
    background: #06d6a0;
    color: #172044;
    border: none;
    border-radius: 10px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
`;

playAgainButton.onclick = () => {
    winPopup.style.display = "none";
    shufflePuzzle();
    drawBoard();
};

popupContent.appendChild(playAgainButton);
winPopup.appendChild(popupContent);
document.body.appendChild(winPopup);


const controls = document.createElement("div");
controls.style.cssText = "margin: 20px;";
document.body.appendChild(controls);


const newGameButton = document.createElement("button");
newGameButton.textContent = "🎮 New Game";

newGameButton.style.cssText = `
    padding: 12px 25px;
    margin: 10px;
    background: #06d6a0;
    color: #172044;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
`;

newGameButton.onclick = () => {
    shufflePuzzle();
    drawBoard();
};

document.body.appendChild(newGameButton);


function shufflePuzzle() {
    // Start with solved arrangement
    numbers.splice(0, numbers.length, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    // Perform 30 valid random rotations
    for (let i = 0; i < 30; i++) {
        const row = Math.floor(Math.random() * 2);
        const col = Math.floor(Math.random() * 2);

        const a = row * 3 + col;
        const b = a + 1;
        const c = a + 3;
        const d = a + 4;

        const old = [numbers[a], numbers[b], numbers[c], numbers[d]];

        if (Math.random() < 0.5) {
            numbers[a] = old[2];
            numbers[b] = old[0];
            numbers[c] = old[3];
            numbers[d] = old[1];
        } else {
            numbers[a] = old[1];
            numbers[b] = old[3];
            numbers[c] = old[0];
            numbers[d] = old[2];
        }
    }

    moves = 0;
    selected = 0;
}





function checkSolved() {
    const solved = numbers.every((number, index) => {
        return number === index + 1;
    });

    if (solved) {
        completionMessage.textContent = "";

        status.textContent = "Total Moves: " + moves;

        document.getElementById("final-moves").textContent =
            "Total Moves: " + moves;

        winPopup.style.display = "flex";
    } else {
        completionMessage.textContent = "";
        winPopup.style.display = "none";
    }
}



function drawBoard() {
    board.innerHTML = "";

    numbers.forEach((number, index) => {
        const tile = document.createElement("button");

        tile.textContent = number;
        tile.style.cssText = `
            width: 80px;
            height: 80px;
            background: ${selected === index ? "#ff9f1c" : "#ffd166"};
            color: #25204f;
            font-size: 28px;
            font-weight: bold;
            border: 3px solid white;
            border-radius: 12px;
            cursor: pointer;
        `;

        tile.onclick = () => {
            selected = index;
            drawBoard();
        };

        board.appendChild(tile);
    });

    status.textContent = "Moves Made: " + moves;
     checkSolved();
}

function rotate(clockwise) {
    const row = Math.floor(selected / 3);
    const col = selected % 3;

    if (row > 1 || col > 1) {
        status.textContent = "Choose a 2 x 2 block starting in the top-left area.";
        return;
    }

    const a = row * 3 + col;
    const b = a + 1;
    const c = a + 3;
    const d = a + 4;

    const old = [numbers[a], numbers[b], numbers[c], numbers[d]];

    if (clockwise) {
        numbers[a] = old[2];
        numbers[b] = old[0];
        numbers[c] = old[3];
        numbers[d] = old[1];
    } else {
        numbers[a] = old[1];
        numbers[b] = old[3];
        numbers[c] = old[0];
        numbers[d] = old[2];
    }

    moves++;
    selected = a;
    drawBoard();
}

const clockwiseButton = document.createElement("button");
clockwiseButton.textContent = "↻ Rotate Clockwise";
clockwiseButton.onclick = () => rotate(true);

const counterButton = document.createElement("button");
counterButton.textContent = "↺ Rotate Counterclockwise";
counterButton.onclick = () => rotate(false);

[clockwiseButton, counterButton].forEach(button => {
    button.style.cssText = `
        padding: 12px;
        margin: 5px;
        border-radius: 8px;
        cursor: pointer;
    `;
    controls.appendChild(button);
});

shufflePuzzle();
drawBoard();

