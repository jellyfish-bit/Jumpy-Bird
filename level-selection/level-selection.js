const dbName = "PlayerDataBase";
const request = indexedDB.open(dbName, 6);
const playerId = Number(sessionStorage.getItem("currentPlayerId"));
let db;

let birdColor;
let headAccessory;
let handAccessory;
let levelsComplete = 0;
let highScore = 0;
let accsStats;
let settings = {
  easyMode: false,
  showFps: false,
  capFps: true,
};

request.onerror = (event) => {
  console.error("IndexDB is not allowed or version is to low");
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadPlayerData();
  loadLevelData();
  loadSettingData();
}


const colorList = [
  "blue",
  "red",
  "green",
  "yellow"
];
const headSlot = "head";
const headAccessoryList = [
  "crown",
  "royal",
  "magic"
]
if (!headAccessoryList.includes(headAccessory)) {
  headAccessory = "none"
}
const handSlot = "hand";
const handAccessoryList = [
  "waterstaff",
  "blaststaff"
]
if (!handAccessoryList.includes(handAccessory)) {
  handAccessory = "none"
}




function birdColorPressed(pColor, pLevelsNeeded) {
  if (levelsComplete >= pLevelsNeeded) {
    birdColor = pColor;
    accsStats.colorBird = pColor;

    resetStyleAllBirds();
    document.getElementById(pColor + "-bird").style.opacity = "1";
    document.getElementById(pColor + "-bird").className = "item-image item-active-shadow";

    saveAccessoryData();
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
    headAccessory = "none";
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


function loadAccsessoryAsObj() {
  return JSON.parse(sessionStorage.getItem("accessoryStats"));
}
function updateAccessoryObj() {

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
    colorBird: birdColor,
    headName: headAccessory,
    handName: handAccessory,
    bonusLives: 0,
    staffUsage: 0,
    shieldDurability: 0,
    scoreMultiplier: 1.0,
    accelerationDecrease: 1.0,
  }
  console.log("Test: " + JSON.stringify(accsStats));
}

function resetUpdateSaveAccsStats() {
  resetAccessoryObj();
  updateAccessoryObj();

  saveAccessoryData();
}

function saveAccessoryData() {

  saveAccessoryStats();
  const objectStore = db.transaction(["playerAccessoryData"], "readwrite")
    .objectStore("playerAccessoryData");

  const request = objectStore.get(Number(playerId));
  request.onsuccess = (event) => {

    const data = event.target.result;

    data.birdColor = birdColor;
    data.headAccessory = headAccessory;
    data.handAccessory = handAccessory;

    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      // Do something with the error
      console.error("Error saving Accessory Data")

    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!


    };
  };


}
function saveAccessoryStats() {

  sessionStorage.setItem("accessoryStats", JSON.stringify(accsStats));
}

function loadPlayerData() {
  if (playerId === null) {
    return;
  }
  db.transaction("players").objectStore("players")
    .get(Number(playerId)).onsuccess = (event) => {
      const color = event.target.result.playerColor;
      const name = event.target.result.playerName;


      const elementProfile = document.getElementById("player-profile");
      const elementProfileName = document.getElementById("player-profile-name");
      elementProfileName.innerText = name;
      elementProfileName.style.color = getContrastYIQ(color);

      elementProfile.style.backgroundColor = color;
      elementProfile.style.borderColor = getContrastYIQ(color);


    }

}
function loadLevelData() {
  db.transaction("playerLevelData").objectStore("playerLevelData")
    .get(Number(playerId)).onsuccess = (event) => {
      highScore = Math.floor(Number(event.target.result.highscoreEndless) / 60);
      if (highScore > 0) {
        document.getElementById("endless").innerText = "Endless Mode - " + highScore;
      }
      if (event.target.result.completeLevel1) {
        document.getElementById("level1").innerText = "Level 1 \u2713";
        levelsComplete++;
      }
      if (event.target.result.completeLevel2) {
        document.getElementById("level2").innerText = "Level 2 \u2713";
        levelsComplete++;
      }
      if (event.target.result.completeLevel3) {
        document.getElementById("level3").innerText = "Level 3 \u2713";
        levelsComplete++;
      }

      loadAccessoryData();
    }
}
function loadAccessoryData() {
  const r = db.transaction("playerAccessoryData").objectStore("playerAccessoryData")
    .get(Number(playerId)).onsuccess = (event) => {
      birdColor = event.target.result.birdColor;
      headAccessory = event.target.result.headAccessory;
      handAccessory = event.target.result.handAccessory;

      resetAccessoryObj();
      updateBirdImageElement();
      birdColorPressed(birdColor, levelsComplete);


      unlockAccs(headSlot, headAccessoryList);
      selectAccs(headAccessory, headSlot);
      unlockAccs(handSlot, handAccessoryList);
      selectAccs(handAccessory, handSlot);
    }
}
function loadSettingData() {
  const r = db.transaction("playerSettingData").objectStore("playerSettingData")
    .get(Number(playerId)).onsuccess = (event) => {
      settings.easyMode = event.target.result.easyMode;
      settings.showFps = event.target.result.showFps;
      settings.capFps = event.target.result.capFps;

      //Update inputs
      document.getElementById("setting-easy-mode").checked = settings.easyMode;
      document.getElementById("setting-fps").checked = settings.showFps;
      document.getElementById("setting-fps-cap").checked = settings.capFps;

      saveSettings();
    }
}

function getContrastYIQ(hexcolor) {
  let r = parseInt(hexcolor.substring(1, 3), 16);
  let g = parseInt(hexcolor.substring(3, 5), 16);
  let b = parseInt(hexcolor.substring(5, 7), 16);
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#101015' : '#e2e2e2';
}

function saveSettings() {
  sessionStorage.setItem("settings", JSON.stringify(settings));

}
function saveSettingData() {
  const objectStore = db.transaction(["playerSettingData"], "readwrite")
    .objectStore("playerSettingData");

    const request = objectStore.get(Number(playerId));
    request.onsuccess = (event) => {

    const data = event.target.result;

    data.easyMode = settings.easyMode;
    data.showFps = settings.showFps;
    data.capFps = settings.capFps;

    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      // Do something with the error
      console.error("Error saving settings")

    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!


    };
  };
}
function settingsChanged() {
  updateSettings();
  saveSettings();
  saveSettingData();
}

function updateSettings() {
  settings = {
    easyMode: document.getElementById("setting-easy-mode").checked,
    showFps: document.getElementById("setting-fps").checked,
    capFps: document.getElementById("setting-fps-cap").checked
  }

}
