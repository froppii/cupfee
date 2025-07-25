const dials = document.querySelectorAll(".dial");
const clue = document.getElementById("clue");
const feedback = document.getElementById("feedback");

const labelSets = [
  ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark", "French", "Italian", "City", "Full City", "Vienna", "Espresso", "Double Roast"],
  ["None", "Hint", "Mild", "Sweet", "Very Sweet", "Syrupy", "Overloaded", "Balanced", "Dry", "Tangy", "Sugary", "Burnt"],
  ["Nutty", "Fruity", "Floral", "Spicy", "Herbal", "Smoky", "Citrus", "Earthy", "Berry", "Chocolatey", "Malty", "Caramel"]
];

const cluePhrases = [
  [ // Roast
    "barely kissed by the roaster",
    "like sunshine in a cup",
    "the classic middle child",
    "getting a little toasty",
    "dark but not broody",
    "roasted like a Parisian poet’s soul",
    "bold like espresso with a mustache",
    "roasted on city streets (figuratively)",
    "deep caramel glow",
    "somewhere between fancy and fire",
    "espresso’s edgy cousin",
    "roasted like it owes you money"
  ],
  [ // Sweetness
    "not even a sprinkle of sugar",
    "just a tiny sweet wink",
    "mild like a shy compliment",
    "sweet enough to smile about",
    "basically dessert in disguise",
    "like syrup stuck to your fingers",
    "so sweet it’s suspicious",
    "perfect sugar balance, chef's kiss",
    "dry, like your humor",
    "a zingy surprise",
    "dusty candy vibes",
    "oops... burnt marshmallow"
  ],
  [ // Flavor
    "tastes like a cozy campfire",
    "like biting into a fruit ad",
    "a bouquet in a mug",
    "spicy like a plot twist",
    "green and chill",
    "smoky like drama in the group chat",
    "bright and zesty",
    "like digging up good dirt",
    "berry nice, berry fun",
    "a melted chocolate bar moment",
    "malty like cereal nostalgia",
    "wrapped in caramel hugs"
  ]
];

let angles = [0, 0, 0];
let targetCombo = [];
let gameFinished = false;

let startTime;
let timerInterval;

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  const elapsed = Date.now() - startTime;
  const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getTodaySeed() {
  return new Date().toISOString().slice(0, 10);
}

function getRandomCombo() {
  const rng = new Math.seedrandom(getTodaySeed());
  return Array.from({ length: 3 }, () => Math.floor(rng() * 12));
}

function generateClue(combo) {
  const roastClue = cluePhrases[0][combo[0]];
  const sweetClue = cluePhrases[1][combo[1]];
  const flavorClue = cluePhrases[2][combo[2]];
  return `This brew? Think: ${roastClue}, ${sweetClue}, and kinda ${flavorClue}.`;
}

function updateReadouts() {
  dials.forEach((dial, i) => {
    const readout = dial.querySelector(".readout");
    const label = labelSets[i][angles[i] % 12];
    readout.textContent = `${angles[i]}° – ${label}`;
    dial.querySelector(".knob").style.transform = `rotate(${angles[i] * 30}deg)`;
  });
}

function createTicks(container) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.transform = `rotate(${i * 30}deg) translateY(-34px)`;
    container.appendChild(tick);
  }
}
document.querySelectorAll(".tick-marks").forEach(createTicks);

// Dial interaction
dials.forEach((dial, index) => {
  const knob = dial.querySelector(".knob");
  let isDragging = false;
  let startY = 0;

  knob.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY;
    document.body.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.cursor = "default";
  });

  window.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaY = e.clientY - startY;
      if (Math.abs(deltaY) > 25) {
        angles[index] = (angles[index] + (deltaY > 0 ? 1 : -1) + 12) % 12;
        startY = e.clientY;
        updateReadouts();
      }
    }
  });
});

function checkGuess() {
  if (gameFinished) return;

  const guess = [...angles];

  let correctCount = 0;
  let closeCount = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === targetCombo[i]) {
      correctCount++;
    } else if (Math.abs(guess[i] - targetCombo[i]) === 1) {
      closeCount++;
    }
  }

  const result = document.getElementById("result");
  const shareText = document.getElementById("share-text");
  const copyButton = document.getElementById("copy-button");

  if (correctCount === 3) {
    gameFinished = true;
    const timeTaken = stopTimer();
    result.textContent = "YOU GOT IT!!!";

    const now = new Date();
    const dayOffset = Math.floor((now - new Date("2025-07-25")) / (1000 * 60 * 60 * 24));
    const puzzleNumber = 1 + dayOffset;
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    shareText.textContent =
`[cupfee #${puzzleNumber}]
${formattedDate}
🕓 ${timeTaken}
froppii.github.io/cupfee`;

    shareText.style.display = "block";
    copyButton.style.display = "inline-block";
  } else if (correctCount === 2) {
    result.textContent = "so so close! Just one dial’s a bit off...";
  } else if (correctCount === 1) {
    result.textContent = "one setting’s spot on.";
  } else if (closeCount > 0) {
    result.textContent = "Not quite, but you’re circling the flavor. Try tweaking the dials a bit!";
  } else {
    result.textContent = "this cup’s not even drinkable :p";
  }
}


document.getElementById("brew").addEventListener("click", checkGuess);

targetCombo = getRandomCombo();
clue.textContent = "Clue: " + generateClue(targetCombo);
updateReadouts();

function startGame() {
  document.getElementById("startButton").style.display = "none"; 
  document.getElementById("puzzle").style.display = "block";     
  targetCombo = getRandomCombo();
  clue.textContent = "Clue: " + generateClue(targetCombo);
  updateReadouts();
  startTimer();
}

window.onload = () => {
  document.getElementById("startButton").addEventListener("click", startGame);
};

document.getElementById("copy-button").addEventListener("click", () => {
  const text = document.getElementById("share-text").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const confirm = document.getElementById("copy-confirmation");
    confirm.style.display = "inline";
    setTimeout(() => {
      confirm.style.display = "none";
    }, 2000);
  });
});



