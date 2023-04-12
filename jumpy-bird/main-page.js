let levelsComplete = 0;
let highScore = localStorage.getItem('highscore');
if (highScore === null) {
  highScore = 0;
} else {
  highScore = Math.floor(highScore / 60);
}

const level1Complete = localStorage.getItem('levelComplete1');
if (level1Complete == "true") {
  document.getElementById("level1").innerText = 'Level 1 \u2713';
  levelsComplete++;
}

const level2Complete = localStorage.getItem('levelComplete2');
if (level2Complete == "true") {
  document.getElementById("level2").innerText = 'Level 2 \u2713';
  levelsComplete++;
}

const level3Complete = localStorage.getItem('levelComplete3');
if (level3Complete == "true") {
  document.getElementById("level3").innerText = 'Level 3 \u2713';
  levelsComplete++;
}

const colorList = [
  "blue",
  "red",
  "green",
  "yellow"
];
let birdColor = localStorage.getItem('birdColor');
if (birdColor === null) {
  birdColor = 'blue';
}


let accsStats = loadAccsessoryAsObj();
if (accsStats === null) {
  accsStats = {
    handName: "none",
    headName: "none",
    bonusLives: 0,
    staffUsage: 0,
    shieldDurability: 0,
    scoreMultiplier: 1.0,
    accelerationDecrease: 1.0,
  }
}

let headAccessory = accsStats.headName;
const headSlot = "head";
const headAccessoryList = [
  "crown",
  "royal",
  "magic"
]
if (!headAccessoryList.includes(headAccessory)) {
  headAccessory = "none"
}

let handAccessory = accsStats.handName;
const handSlot = "hand";
const handAccessoryList = [
  "waterstaff",
  "blaststaff"
]
if (!handAccessoryList.includes(handAccessory)) {
  handAccessory = "none"
}

updateBirdImageElement();
birdColorPressed(birdColor, levelsComplete);

unlockAccs(headSlot, headAccessoryList);
selectAccs(headAccessory, headSlot);
unlockAccs(handSlot, handAccessoryList);
selectAccs(handAccessory, handSlot);





function birdColorPressed(pColor, pLevelsNeeded) {
  if (levelsComplete >= pLevelsNeeded) {
    localStorage.setItem("birdColor", pColor);
    birdColor = pColor;

    resetStyleAllBirds();
    document.getElementById(pColor + "-bird").style.opacity = "1";
    document.getElementById(pColor + "-bird").className = "item-image item-active-shadow";

    
  }
}
function resetStyleAllBirds() {
  colorList.forEach(colorName => {
    const birdElement = document.getElementById(colorName + "-bird");
    birdElement.style.opacity = "0.5";
    birdElement.className = "item-image";
  
  });
}
function updateBirdImageElement() {
  let birdCount = 0;
  colorList.forEach(colorName => {
    const birdElement = document.getElementById(colorName + "-bird");
    const birdElementSpan = document.getElementById(colorName + "-bird-hover");

    birdElement.style.opacity = "0.5";

    if (birdCount <= levelsComplete) {
      birdElement.src = 'images/' + colorName + '_flappy_bird.png';
      birdElement.className = 'item-image';
      birdElementSpan.removeAttribute('data-title')
    }
    birdCount++;
  });
}

function headAccsPressed(pName) {
  if (pName == headAccessory) {
    deselectAccs(pName, headSlot);
    headAccessory = "none"
  } else {
    if (selectAccs(pName, headSlot)) {
      headAccessory = pName;
      deselectAccsExcept(pName, headSlot, headAccessoryList);
    }
  }
  resetUpdateSaveAccsStats();
}
function handAccsPressed(pName) {
  if (pName == handAccessory) {
    deselectAccs(pName, handSlot);
    handAccessory = "none"
  } else {
    if (selectAccs(pName, handSlot)) {
      handAccessory = pName;
      deselectAccsExcept(pName, handSlot, handAccessoryList);
    }
  }
  resetUpdateSaveAccsStats();
}

function unlockAccs(pSlot, pAccsList) {
  pAccsList.forEach(accsName => {
    const accsElement = document.getElementById(accsName + "-" + pSlot);
    const accsElementSpan = document.getElementById(accsName + '-hover');

    if (accsElementSpan.getAttribute("data-score") <= highScore &&
      accsElementSpan.getAttribute("data-level") <= levelsComplete) {
      accsElement.className = 'item-image';
      accsElement.src = "images/accessories/" + accsName + "_display.png";
      accsElementSpan.removeAttribute("data-title");
    }
    accsElement.style.opacity = "0.5";


  });
}
function selectAccs(pName, pSlot) {
  if (pName == "none") {
    return false;
  }

  const accsElement = document.getElementById(pName + "-" + pSlot);
  const accsElementSpan = document.getElementById(pName + '-hover');

  if (accsElementSpan.getAttribute("data-score") <= highScore &&
    accsElement.getAttribute("data-level") <= levelsComplete) {

    accsElement.style.opacity = "1";
    accsElement.className = "item-image item-active-shadow"
    return true;
  }
  return false;

}
function deselectAccs(pName, pSlot) {
  if (pName == "none") {
    return;
  }
  document.getElementById(pName + "-" + pSlot).style.opacity = "0.5";
  document.getElementById(pName + "-" + pSlot).className = "item-image";

}

function deselectAccsExcept(pName, pSlot, pAccsList) {
  pAccsList.forEach(accsName => {
    if (pName != accsName) {
      const accsElement = document.getElementById(accsName + "-" + pSlot);
      accsElement.style.opacity = "0.5";
      accsElement.className = "item-image"
      
    }
  });
}


function saveAccs(pSlot, pValue) {
  localStorage.setItem(pSlot + 'Accessory', pValue);
}


function saveAccessoryStats() {
  localStorage.setItem("accessoryStats", JSON.stringify(accsStats));
}
function loadAccsessoryAsObj() {
  return JSON.parse(localStorage.getItem("accessoryStats"));
}
function updateAccessoryObj() {
  accsStats.headName = headAccessory;
  accsStats.handName = handAccessory;
  if (headAccessory === "crown") {
    accsStats.scoreMultiplier += 0.2;
  }
  else if (headAccessory === "royal") {
    accsStats.scoreMultiplier += 0.5;
    accsStats.bonusLives += 1;
  }
  else if (headAccessory === "magic") {
    accsStats.bonusLives += 1;
    accsStats.accelerationDecrease += 0.2
  }

  if (handAccessory === "blaststaff") {
    accsStats.staffUsage += 1;
  }
  else if (handAccessory === "waterstaff") {
    accsStats.staffUsage += 1;
    accsStats.accelerationDecrease += 0.3;
  }
}
function resetAccessoryObj() {
  accsStats = {
    handName: "none",
    headName: "none",
    bonusLives: 0,
    staffUsage: 0,
    shieldDurability: 0,
    scoreMultiplier: 1.0,
    accelerationDecrease: 1.0,
  }
}

function resetUpdateSaveAccsStats() {
  resetAccessoryObj();
  updateAccessoryObj();
  saveAccessoryStats();
}