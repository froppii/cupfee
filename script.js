const dials = document.querySelectorAll(".dial");
const clue = document.getElementById("clue");
const feedback = document.getElementById("feedback");

const labelSets = [
  ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark", "French", "Italian", "City", "Full City", "Vienna", "Espresso", "Double Roast"],
  ["None", "Hint", "Mild", "Sweet", "Very Sweet", "Syrupy", "Overloaded", "Balanced", "Dry", "Tangy", "Sugary", "Burnt"],
  ["Nutty", "Fruity", "Floral", "Spicy", "Herbal", "Smoky", "Citrus", "Earthy", "Berry", "Chocolatey", "Malty", "Caramel"]
];

let angles = [0, 0, 0];  // starting positions
let targetCombo = [];

function getTodaySeed() {
  const today = new Date().toISOString().slice(0, 10);
  return today;
}

function getRandomCombo() {
  const seed = getTodaySeed();
  const rng = new Math.seedrandom(seed);
  return Array.from({ length: 3 }, () => Math.floor(rng() * 12));
}

function generateClue(combo) {
  return `Today’s cup leans ${labelSets[0][combo[0]]}, ${labelSets[1][combo[1]]}, with a ${labelSets[2][combo[2]]} twist.`;
}

function updateReadouts() {
  dials.forEach((dial, i) => {
    const readout = dial.querySelector(".readout");
    const label = labelSets[i][angles[i] % 12];
    readout.textContent = `${angles[i]}° – ${label}`;
    dial.querySelector(".knob").style.transform = `rotate(${angles[i] * 30}deg)`;
  });
}

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
      if (Math.abs(deltaY) > 15) {
        angles[index] = (angles[index] + (deltaY > 0 ? 1 : -1) + 12) % 12;
        startY = e.clientY;
        updateReadouts();
      }
    }
  });
});

document.getElementById("brew").addEventListener("click", () => {
  const isCorrect = angles.every((val, i) => val === targetCombo[i]);
  feedback.textContent = isCorrect ? "Perfect! ☕ You brewed the Cupfee of the day!" : "Hmm... not quite right.";
});

targetCombo = getRandomCombo();
clue.textContent = "Clue: " + generateClue(targetCombo);
updateReadouts();
