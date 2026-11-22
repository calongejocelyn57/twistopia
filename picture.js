
// TWISTOPIA - Picture Twist
// Level 1: Panda 3 x 3

const puzzle = document.getElementById("picture-game");

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let selected = 0;
let moves = 0;

const board = document.createElement("div");

board.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, min(28vw, 100px));
    gap: 4px;
    justify-content: center;
    margin: 25px auto;
    width: fit-content;
`;

puzzle.appendChild(board);

const status = document.createElement("p");
puzzle.appendChild(status);

const controls = document.createElement("div");
controls.style.textAlign = "center";
puzzle.appendChild(controls);

// Victory popup
const popup = document.createElement("div");

popup.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

popup.innerHTML = `
    <div style="
        background: white;
        color: #222;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        width: 280px;
    ">
        <h2>🎉 CONGRATULATIONS!</h2>
        <p>You completed the puzzle!</p>
        <p id="final-moves"></p>
        <button id="play-again" style="
            padding: 12px 20px;
            margin-top: 15px;
            cursor: pointer;
        ">Play Again</button>
    </div>
`;

document.body.appendChild(popup);

function drawBoard() {
    board.innerHTML = "";

    numbers.forEach((number, index) => {
        const tile = document.createElement("button");

        const originalIndex = number - 1;
        const row = Math.floor(originalIndex / 3);
        const col = originalIndex % 3;

        
const tileSize = Math.min(window.innerWidth * 0.28, 100);

tile.style.cssText = `
    width: ${tileSize}px;
    height: ${tileSize}px;
    position: relative;
    border: 2px solid white;
    border-radius: 5px;
    cursor: pointer;
    background-image: url("panda.png");
    background-size: ${tileSize * 3}px ${tileSize * 3}px;
    background-position: -${col * tileSize}px -${row * tileSize}px;
    background-repeat: no-repeat;
    outline: ${selected === index ? "4px solid orange" : "none"};
`;


        const label = document.createElement("span");
        label.textContent = number;

        label.style.cssText = `
            position: absolute;
            top: 3px;
            left: 3px;
            background: white;
            color: black;
            padding: 3px 6px;
            border-radius: 5px;
            font-weight: bold;
        `;

        tile.appendChild(label);

        tile.onclick = () => {
            selected = index;
            drawBoard();
        };

        board.appendChild(tile);
    });

    status.textContent = "Moves Made: " + moves;
}

function rotateNumbers(clockwise) {
    const row = Math.floor(selected / 3);
    const col = selected % 3;

    if (row > 1 || col > 1) return false;

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

    return true;
}

function rotate(clockwise) {
    if (popup.style.display === "flex") return;

    if (!rotateNumbers(clockwise)) return;

    moves++;
    drawBoard();
    checkSolved();
}

function checkSolved() {
    const solved = numbers.every((number, index) => {
        return number === index + 1;
    });

    if (solved) {
        document.getElementById("final-moves").textContent =
            "Total Moves: " + moves;

        popup.style.display = "flex";
    }
}

function shufflePuzzle() {
    numbers.splice(0, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    do {
        for (let i = 0; i < 30; i++) {
            selected = Math.floor(Math.random() * 2) * 3
                + Math.floor(Math.random() * 2);

            rotateNumbers(Math.random() < 0.5);
        }
    } while (numbers.every((number, index) => number === index + 1));

    moves = 0;
    selected = 0;
    popup.style.display = "none";
}

const clockwiseButton = document.createElement("button");
clockwiseButton.textContent = "↻ Clockwise";
clockwiseButton.onclick = () => rotate(true);

const counterButton = document.createElement("button");
counterButton.textContent = "↺ Counterclockwise";
counterButton.onclick = () => rotate(false);

const newGameButton = document.createElement("button");
newGameButton.textContent = "🎮 New Game";
newGameButton.onclick = () => {
    shufflePuzzle();
    drawBoard();
};

document.getElementById("play-again").onclick = () => {
    shufflePuzzle();
    drawBoard();
};

[clockwiseButton, counterButton, newGameButton].forEach(button => {
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
