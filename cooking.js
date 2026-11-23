
// TWISTOPIA - COOKING ADVENTURE
// STAGE 1 - WRONG ACTION CHALLENGE

const $ = id => document.getElementById(id);


// SOUND EFFECT SYSTEM

const soundToggleBtn = $("soundToggleBtn");

let soundEnabled = true;
let audioContext = null;

function playSound(frequency, duration, type = "sine", volume = 0.12) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log("Sound unavailable:", error);
  }
}

function buttonSound() {
  playSound(650, 0.08, "sine", 0.08);
}

function wrongSound() {
  playSound(180, 0.25, "sawtooth", 0.12);
  setTimeout(() => playSound(120, 0.3, "sawtooth", 0.1), 150);
}

function cookingSound() {
  playSound(350, 0.15, "triangle", 0.08);
  setTimeout(() => playSound(450, 0.15, "triangle", 0.08), 180);
}

function successSound() {
  playSound(523, 0.15, "sine");
  setTimeout(() => playSound(659, 0.15, "sine"), 160);
  setTimeout(() => playSound(784, 0.3, "sine"), 320);
}

function gameOverSound() {
  playSound(350, 0.25, "triangle");
  setTimeout(() => playSound(260, 0.3, "triangle"), 250);
  setTimeout(() => playSound(180, 0.5, "triangle"), 550);
}

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundToggleBtn.textContent =
    soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";

  if (soundEnabled) {
    buttonSound();
  }
});

const customerCountText = $("customerCount");
const scoreText = $("score");
const coinsText = $("coins");
const timerText = $("timer");

const customerName = $("customerName");
const orderDetails = $("orderDetails");
const orderStatus = $("orderStatus");
const selectedFoodText = $("selectedFood");
const gameMessage = $("game-message");
const customerCharacter = $("customer-character");

const takeOrderBtn = $("takeOrderBtn");
const cookBtn = $("cookBtn");
const prepareBtn = $("prepareBtn");
const serveBtn = $("serveBtn");

const foodButtons = document.querySelectorAll(".food-btn");

const resultPanel = $("result-panel");
const resultTitle = $("resultTitle");
const resultDetails = $("resultDetails");
const playAgainBtn = $("playAgainBtn");
const mainMenuBtn = $("mainMenuBtn");
const restartGameBtn = $("restartGameBtn");
const mainMenuTopBtn = $("mainMenuTopBtn");


const wrongActionPanel = $("wrongActionPanel");
const wrongActionMessage = $("wrongActionMessage");
const continueGameBtn = $("continueGameBtn");
const endGameBtn = $("endGameBtn");

const menu = {
  burger: {
    name: "BURGER",
    emoji: "🍔",
    action: "cook",
    time: 5
  },
  fries: {
    name: "FRENCH FRIES",
    emoji: "🍟",
    action: "cook",
    time: 4
  },
  drink: {
    name: "DRINK",
    emoji: "🥤",
    action: "prepare",
    time: 2
  }
};

const customerNames = [
  "Alex", "Mia", "Liam", "Sofia",
  "Noah", "Ella", "Lucas", "Chloe",
  "Ethan", "Zoe", "Daniel", "Ava"
];

const customerAvatars = [
  "🧑", "👩", "🧔", "👱‍♀️",
  "👨", "👧", "👦", "👩‍🦰"
];

const foodChoices = ["burger", "fries", "drink"];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createRandomCustomer() {
  return {
    name: randomItem(customerNames),
    avatar: randomItem(customerAvatars),
    food: randomItem(foodChoices)
  };
}

let customerOrders = [];

let customerIndex = 0;
let score = 0;
let coins = 0;
let timeLeft = 180;

let currentOrder = null;
let selectedFood = null;

let orderTaken = false;
let isPreparing = false;
let foodReady = false;
let gameOver = false;
let warningOpen = false;

let preparationTimeLeft = 0;
let lastUpdate = Date.now();
let nextCustomerTimeout = null;


function showMessage(message) {
  gameMessage.textContent = message;
}

function updateDisplay() {
  customerCountText.textContent = customerIndex + " / 3";
  scoreText.textContent = score;
  coinsText.textContent = coins;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  timerText.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");

  if (currentOrder) {
    customerName.textContent = currentOrder.name;
  }

  selectedFoodText.textContent = selectedFood
    ? "Selected food: " + menu[selectedFood].emoji +
      " " + menu[selectedFood].name
    : "Selected food: None";

  // Food selection buttons
  foodButtons.forEach(button => {
    const foodId = button.dataset.food;

    button.classList.toggle("selected", foodId === selectedFood);

    button.disabled =
      gameOver || warningOpen ||
      !orderTaken || isPreparing || foodReady;
  });

  // All four action buttons stay clickable during gameplay.
  // Wrong actions are handled by their functions.
  const actionButtonsDisabled = gameOver || warningOpen;

  takeOrderBtn.disabled = actionButtonsDisabled;
  cookBtn.disabled = actionButtonsDisabled;
  prepareBtn.disabled = actionButtonsDisabled;
  serveBtn.disabled = actionButtonsDisabled;
}

function startCustomer() {
  if (customerIndex >= 3) {
    finishGame(true);
    return;
  }

  currentOrder = customerOrders[customerIndex];

  orderTaken = false;
  selectedFood = null;
  isPreparing = false;
  foodReady = false;
  preparationTimeLeft = 0;

  customerCharacter.textContent = currentOrder.avatar;
  customerName.textContent = currentOrder.name;
  orderDetails.textContent = "Waiting for chef...";
  orderStatus.textContent = "Press TAKE ORDER to see the order.";

  showMessage(currentOrder.name + " is waiting at the counter!");

  updateDisplay();
}

// WRONG ACTION SYSTEM

function wrongAction(actionName, message) {
  if (gameOver || warningOpen) return;

  score = Math.max(0, score - 20);
wrongSound();
  warningOpen = true;

  wrongActionMessage.textContent =
    message || "You pressed the wrong action: " + actionName + "!";

  wrongActionPanel.classList.remove("hidden");

  showMessage("Wrong action! 20 points deducted.");

  updateDisplay();
}

function continueGame() {
  if (!warningOpen) return;

  warningOpen = false;
  wrongActionPanel.classList.add("hidden");

  showMessage("Game continues! Be careful, Chef!");

  lastUpdate = Date.now();
  updateDisplay();
}

function endGame() {
  warningOpen = false;
  wrongActionPanel.classList.add("hidden");

  finishGame(false, true);
}

// TAKE ORDER

function takeOrder() {
  if (gameOver || warningOpen) return;

  if (orderTaken) {
    wrongAction("TAKE ORDER", "You already took this customer's order!");
    return;
  }

  if (!currentOrder) return;

  orderTaken = true;

  const food = menu[currentOrder.food];

  orderDetails.textContent = food.emoji + " " + food.name;
  orderStatus.textContent = "Customer ordered " + food.name + "!";

  showMessage("Order received! Prepare " + food.name + ".");

  updateDisplay();
}

// SELECT FOOD

function selectFood(foodId) {
  if (gameOver || warningOpen) return;

  if (!orderTaken) {
    showMessage("Take the customer's order first!");
    return;
  }

  if (isPreparing || foodReady) {
    showMessage("Finish the current order first!");
    return;
  }

  if (!menu[foodId]) return;

  selectedFood = foodId;

  orderStatus.textContent = "Selected: " + menu[foodId].name;

  showMessage(menu[foodId].emoji + " " + menu[foodId].name + " selected!");

  updateDisplay();
}

// COOK AND PREPARE

function startPreparation(actionType) {
  if (gameOver || warningOpen) return;

  const actionName = actionType === "cook" ? "COOK" : "PREPARE";

  if (!orderTaken) {
    wrongAction(actionName, "Take the customer's order first!");
    return;
  }

  if (isPreparing || foodReady) {
    wrongAction(actionName, "Your current food is not finished yet!");
    return;
  }

  if (!selectedFood) {
    wrongAction(actionName, "Select food from the menu first!");
    return;
  }

  const food = menu[selectedFood];

  if (food.action !== actionType) {
    wrongAction(
      actionName,
      "Wrong action! " + food.name +
      (food.action === "cook"
        ? " needs COOK!"
        : " needs PREPARE!")
    );
    return;
  }

  if (selectedFood !== currentOrder.food) {
    wrongAction(actionName, "Wrong food! Check the customer's order.");
    return;
  }

  isPreparing = true;
  preparationTimeLeft = food.time;
cookingSound();
  orderStatus.textContent =
    (actionType === "cook" ? "🔥 Cooking " : "🥤 Preparing ") +
    food.name + "...";

  showMessage(actionName + " " + food.name + "! Please wait.");

  updateDisplay();
}

function cookFood() {
  startPreparation("cook");
}

function prepareDrink() {
  startPreparation("prepare");
}

// SERVE

function serveFood() {
  if (gameOver || warningOpen) return;

  if (!foodReady) {
    wrongAction("SERVE", "The food is not ready yet!");
    return;
  }

  if (!selectedFood || selectedFood !== currentOrder.food) {
    wrongAction("SERVE", "That is not the customer's order!");
    return;
  }

  score += 100;
  coins += 20;
successSound();
  customerCharacter.textContent = "😄";
  orderStatus.textContent = "Order successfully served!";

  customerIndex++;

  showMessage("Excellent! +100 points and +20 coins!");

  updateDisplay();

  if (customerIndex >= 3) {
    finishGame(true);
    return;
  }

  
  nextCustomerTimeout = setTimeout(() => {
    if (!gameOver && !warningOpen) {
      startCustomer();
    }
  }, 700);
}

// GAME RESULT

function finishGame(won, manualLoss = false) {
  gameOver = true;
  if (!won) {
  gameOverSound();
}
  warningOpen = false;

  wrongActionPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");

  if (won) {
    resultTitle.textContent = "🏆 STAGE 1 COMPLETE!";

    resultDetails.textContent =
      "Congratulations, Chef! You served all 3 customers. " +
      "Final Score: " + score +
      " | Coins Earned: " + coins;

    showMessage("All customers served! Great job, Chef!");
  } else if (manualLoss) {
    resultTitle.textContent = "💔 YOU LOSE!";

    resultDetails.textContent =
      "Game ended! Final Score: " + score +
      " | Coins Earned: " + coins;

    showMessage("Game over, Chef!");
  } else {
    resultTitle.textContent = "⏰ TIME'S UP!";

    resultDetails.textContent =
      "You served " + customerIndex +
      " out of 3 customers. Final Score: " + score +
      " | Coins Earned: " + coins;

    showMessage("Time is over! Try again, Chef!");
  }

  updateDisplay();
}

// RESTART GAME

function restartGame() {
  if (nextCustomerTimeout) {
    clearTimeout(nextCustomerTimeout);
    nextCustomerTimeout = null;
  }

  customerIndex = 0;
  score = 0;
  coins = 0;
  timeLeft = 180;

  currentOrder = null;
  selectedFood = null;

  orderTaken = false;
  isPreparing = false;
  foodReady = false;
  gameOver = false;
  warningOpen = false;

  preparationTimeLeft = 0;
  lastUpdate = Date.now();

  customerOrders = Array.from(
    { length: 3 },
    () => createRandomCustomer()
  );

  resultPanel.classList.add("hidden");
  wrongActionPanel.classList.add("hidden");

  showMessage("Welcome back, Chef! Get ready for your first customer.");

  startCustomer();
}

// TIMER

function updateTimer() {
  const now = Date.now();
  const delta = Math.min((now - lastUpdate) / 1000, 0.5);

  lastUpdate = now;

  if (gameOver || warningOpen) return;

  timeLeft = Math.max(0, timeLeft - delta);

  if (isPreparing) {
    preparationTimeLeft -= delta;

    if (preparationTimeLeft <= 0) {
      preparationTimeLeft = 0;
      isPreparing = false;
      foodReady = true;

      orderStatus.textContent =
        "✅ " + menu[selectedFood].name + " is ready!";

      showMessage("Food is ready! Press SERVE.");
    } else {
      orderStatus.textContent =
        "Preparing... " + Math.ceil(preparationTimeLeft) + " seconds";
    }
  }

  if (timeLeft <= 0) {
    finishGame(false);
    return;
  }

  updateDisplay();
}


// BUTTON EVENTS

takeOrderBtn.addEventListener("click", () => {
  buttonSound();
  takeOrder();
});

cookBtn.addEventListener("click", () => {
  buttonSound();
  cookFood();
});

prepareBtn.addEventListener("click", () => {
  buttonSound();
  prepareDrink();
});

serveBtn.addEventListener("click", () => {
  buttonSound();
  serveFood();
});

foodButtons.forEach(button => {
  button.addEventListener("click", () => {
    buttonSound();
    selectFood(button.dataset.food);
  });
});

continueGameBtn.addEventListener("click", () => {
  buttonSound();
  continueGame();
});

endGameBtn.addEventListener("click", endGame);

playAgainBtn.addEventListener("click", () => {
  buttonSound();
  restartGame();
});

mainMenuBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

restartGameBtn.addEventListener("click", () => {
  buttonSound();
  restartGame();
});

mainMenuTopBtn.addEventListener("click", () => {
  buttonSound();
  window.location.href = "index.html";
});
// START GAME

customerOrders = Array.from(
  { length: 3 },
  () => createRandomCustomer()
);

startCustomer();

setInterval(updateTimer, 100);
