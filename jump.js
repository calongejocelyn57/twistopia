
// TWISTOPIA - JUMP ADVENTURE

const canvas = document.getElementById("jumpCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const player = {
    x: 55,
    y: 260,
    width: 34,
    height: 38,
    vx: 0,
    vy: 0,
    speed: 4,
    jumpPower: -12,
    grounded: false
};

const gravity = 0.55;
const groundY = 310;

let platforms;
let stars;
let obstacles;
let lives;
let collected;
let gameOver;
let gameWon;
let started;
let leftPressed = false;
let rightPressed = false;
let animationId = null;

function createLevel() {
    platforms = [
        {x: 0, y: groundY, width: 180, height: 50},
        {x: 220, y: 270, width: 100, height: 15},
        {x: 360, y: 235, width: 110, height: 15},
        {x: 510, y: 280, width: 140, height: 80}
    ];

    stars = [
        {x: 145, y: 265, taken: false},
        {x: 265, y: 230, taken: false},
        {x: 410, y: 195, taken: false},
        {x: 565, y: 240, taken: false}
    ];

    obstacles = [
        {x: 115, y: groundY - 25, width: 25, height: 25},
        {x: 455, y: groundY - 25, width: 25, height: 25}
    ];
}

function updateInfo() {
    document.getElementById("stars").textContent =
        collected + "/" + stars.length;

    document.getElementById("lives").textContent = lives;
}

function startGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    player.x = 55;
    player.y = 260;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;

    lives = 3;
    collected = 0;
    gameOver = false;
    gameWon = false;
    started = true;

    leftPressed = false;
    rightPressed = false;

    createLevel();

    document.getElementById("message").textContent =
        "Collect all stars and reach the finish!";

    updateInfo();
    gameLoop();
}

function jump() {
    if (!started || gameOver || gameWon) return;

    if (player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }
}

function moveLeft() {
    if (started && !gameOver && !gameWon) {
        leftPressed = true;
    }
}

function moveRight() {
    if (started && !gameOver && !gameWon) {
        rightPressed = true;
    }
}

function stopLeft() {
    leftPressed = false;
}

function stopRight() {
    rightPressed = false;
}

function rectangleCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function loseLife() {
    lives--;
    updateInfo();

    if (lives <= 0) {
        lives = 0;
        gameOver = true;
        document.getElementById("message").textContent =
            "Game Over! Try again!";
    } else {
        player.x = 55;
        player.y = 260;
        player.vx = 0;
        player.vy = 0;

        document.getElementById("message").textContent =
            "Oops! One life lost. Keep going!";
    }

    updateInfo();
}

function update() {
    if (gameOver || gameWon || !started) return;

    // Horizontal movement
    player.vx = 0;

    if (leftPressed) player.vx = -player.speed;
    if (rightPressed) player.vx = player.speed;

    player.x += player.vx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > W) {
        player.x = W - player.width;
    }

    // Gravity
    player.vy += gravity;
    const previousBottom = player.y + player.height;
    player.y += player.vy;
    player.grounded = false;

    // Platform collision
    platforms.forEach(platform => {
        const currentBottom = player.y + player.height;

        if (
            player.vy >= 0 &&
            previousBottom <= platform.y &&
            currentBottom >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    });

    // Collect stars
    stars.forEach(star => {
        if (
            !star.taken &&
            player.x < star.x + 18 &&
            player.x + player.width > star.x - 18 &&
            player.y < star.y + 18 &&
            player.y + player.height > star.y - 18
        ) {
            star.taken = true;
            collected++;
            updateInfo();
        }
    });

    // Obstacle collision
    obstacles.forEach(obstacle => {
        if (rectangleCollision(player, obstacle)) {
            loseLife();
        }
    });

    // Fall off the screen
    if (player.y > H) {
        loseLife();
    }

    // Win when all stars are collected and player reaches the end
    if (
        collected === stars.length &&
        player.x + player.width >= 610 &&
        player.grounded
    ) {
        gameWon = true;
        document.getElementById("message").textContent =
            "🎉 Amazing! You completed Jump Adventure!";
    }
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#7dd3fc");
    sky.addColorStop(1, "#dbeafe");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    ctx.font = "30px Arial";
    ctx.fillText("☁️", 80, 75);
    ctx.fillText("☁️", 330, 100);
    ctx.fillText("☁️", 550, 65);

    // Finish flag
    ctx.font = "35px Arial";
    ctx.fillText("🏁", 610, 260);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle = "#86efac";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            5
        );
    });
}

function drawStars() {
    stars.forEach(star => {
        if (!star.taken) {
            ctx.font = "25px Arial";
            ctx.textAlign = "center";
            ctx.fillText("⭐", star.x, star.y);
        }
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.font = "25px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "🌵",
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height
        );
    });
}

function drawPlayer() {
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "🐼",
        player.x + player.width / 2,
        player.y + player.height / 2
    );
}

function drawEndScreen() {
    if (!gameOver && !gameWon) return;

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 30px Arial";

    ctx.fillText(
        gameWon ? "YOU WIN!" : "GAME OVER",
        W / 2,
        H / 2
    );

    ctx.font = "18px Arial";
    ctx.fillText(
        "Press RESTART to play again",
        W / 2,
        H / 2 + 35
    );
}

function draw() {
    drawBackground();
    drawPlatforms();
    drawStars();
    drawObstacles();
    drawPlayer();
    drawEndScreen();
}

function gameLoop() {
    update();
    draw();

    if (!gameOver && !gameWon) {
        animationId = requestAnimationFrame(gameLoop);
    } else {
        animationId = null;
    }
}

// Keyboard controls
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" ||
        event.key === "ArrowUp" || event.key === " ") {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft") leftPressed = true;
    if (event.key === "ArrowRight") rightPressed = true;

    if (event.key === "ArrowUp" || event.key === " ") {
        jump();
    }
});

document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft") stopLeft();
    if (event.key === "ArrowRight") stopRight();
});

// Mobile controls
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");

leftBtn.addEventListener("pointerdown", event => {
    event.preventDefault();
    moveLeft();
});

leftBtn.addEventListener("pointerup", stopLeft);
leftBtn.addEventListener("pointerleave", stopLeft);
leftBtn.addEventListener("pointercancel", stopLeft);

rightBtn.addEventListener("pointerdown", event => {
    event.preventDefault();
    moveRight();
});

rightBtn.addEventListener("pointerup", stopRight);
rightBtn.addEventListener("pointerleave", stopRight);
rightBtn.addEventListener("pointercancel", stopRight);

jumpBtn.addEventListener("pointerdown", event => {
    event.preventDefault();
    jump();
});

// Restart
document.getElementById("restartBtn")
    .addEventListener("click", startGame);

// Main menu
document.getElementById("backBtn")
    .addEventListener("click", () => {
        window.location.href = "index.html";
    });

// Start
startGame();
