
// TWISTOPIA - MAZE CHASER

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;

const originalMaze = [
    "###############",
    "#S....#.......#",
    "#.##..#.###...#",
    "#....##...#...#",
    "###..##.#.#.###",
    "#......#.#....#",
    "#.####...####.#",
    "#....#........#",
    "#.#.####.###..#",
    "#.#......#....#",
    "#.######.#.##.#",
    "#........#....#",
    "#.####.###.##.#",
    "#.............#",
    "###############"
];

const starPositions = [
    {x: 12, y: 1},
    {x: 2, y: 3},
    {x: 5, y: 5},
    {x: 12, y: 7},
    {x: 7, y: 9},
    {x: 2, y: 11},
    {x: 12, y: 13}
];

let maze;
let player;
let enemies;
let stars;
let lives;
let collected;
let gameOver;
let gameWon;

function startGame() {
    maze = originalMaze.map(row => row.split(""));

    player = {x: 1, y: 1};

    enemies = [
        {x: 13, y: 1},
        {x: 7, y: 13}
    ];

    stars = starPositions.map(star => ({
        x: star.x,
        y: star.y,
        collected: false
    }));

    lives = 3;
    collected = 0;
    gameOver = false;
    gameWon = false;

    document.getElementById("message").textContent =
        "Collect all the stars! ⭐";

    updateInfo();
    drawMaze();
}

function updateInfo() {
    document.getElementById("stars").textContent =
        collected + "/" + stars.length;

    document.getElementById("lives").textContent = lives;
}

function isWall(x, y) {
    if (
        y < 0 ||
        y >= maze.length ||
        x < 0 ||
        x >= maze[0].length
    ) {
        return true;
    }

    return maze[y][x] === "#";
}

function movePlayer(dx, dy) {
    if (gameOver || gameWon) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (isWall(newX, newY)) return;

    player.x = newX;
    player.y = newY;

    collectStar();
    checkEnemyCollision();

    drawMaze();
    updateInfo();
}

function collectStar() {
    stars.forEach(star => {
        if (
            !star.collected &&
            player.x === star.x &&
            player.y === star.y
        ) {
            star.collected = true;
            collected++;
        }
    });

    if (collected === stars.length) {
        gameWon = true;
        document.getElementById("message").textContent =
            "🎉 YOU WIN! You collected all the stars!";
    }
}

function checkEnemyCollision() {
    enemies.forEach(enemy => {
        if (
            player.x === enemy.x &&
            player.y === enemy.y
        ) {
            lives--;

            if (lives <= 0) {
                lives = 0;
                gameOver = true;
                document.getElementById("message").textContent =
                    "Game Over! Try again!";
            } else {
                player.x = 1;
                player.y = 1;

                document.getElementById("message").textContent =
                    "Oops! You lost a life. Keep going!";
            }

            updateInfo();
        }
    });
}

function moveEnemies() {
    if (gameOver || gameWon) return;

    enemies.forEach(enemy => {
        const directions = [
            {dx: 0, dy: -1},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0},
            {dx: 1, dy: 0}
        ];

        directions.sort(() => Math.random() - 0.5);

        for (const direction of directions) {
            const nextX = enemy.x + direction.dx;
            const nextY = enemy.y + direction.dy;

            if (!isWall(nextX, nextY)) {
                enemy.x = nextX;
                enemy.y = nextY;
                break;
            }
        }
    });

    checkEnemyCollision();
    drawMaze();
    updateInfo();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {

            const px = x * tileSize;
            const py = y * tileSize;

            if (maze[y][x] === "#") {
                ctx.fillStyle = "#2563eb";
                ctx.fillRect(px, py, tileSize, tileSize);

                ctx.strokeStyle = "#60a5fa";
                ctx.strokeRect(px, py, tileSize, tileSize);
            } else {
                ctx.fillStyle = "#172554";
                ctx.fillRect(px, py, tileSize, tileSize);
            }
        }
    }

    // Draw stars
    stars.forEach(star => {
        if (!star.collected) {
            ctx.font = "22px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                "⭐",
                star.x * tileSize + 16,
                star.y * tileSize + 16
            );
        }
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.font = "25px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            "👾",
            enemy.x * tileSize + 16,
            enemy.y * tileSize + 16
        );
    });

    // Draw player
    ctx.font = "27px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        "🐼",
        player.x * tileSize + 16,
        player.y * tileSize + 16
    );

    if (gameOver || gameWon) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            gameWon ? "YOU WIN!" : "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );
    }
}

// Keyboard controls
document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
    };

    if (keys[event.key]) {
        event.preventDefault();
        movePlayer(keys[event.key][0], keys[event.key][1]);
    }
});

// Mobile controls
document.querySelectorAll("[data-direction]").forEach(button => {
    button.addEventListener("click", function() {
        const directions = {
            up: [0, -1],
            down: [0, 1],
            left: [-1, 0],
            right: [1, 0]
        };

        const direction = directions[this.dataset.direction];

        movePlayer(direction[0], direction[1]);
    });
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", startGame);

// Back to Main Menu
document.getElementById("backBtn").addEventListener("click", function() {
    window.location.href = "index.html";
});

// Start the game
startGame();

// Enemy movement
setInterval(moveEnemies, 650);
