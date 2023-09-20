const dbName = "PlayerDataBase";
const request = indexedDB.open(dbName, 6);
let db;
let editMode = false;
const nullDate = new Date(0).valueOf();


request.onerror = (event) => {
  console.error("IndexDB is not allowed");
};

request.onupgradeneeded = (event) => {
  const dbUp = event.target.result;

  const objectPlayerDataStore = dbUp.createObjectStore("players", { keyPath: "playerId", autoIncrement: true });
  objectPlayerDataStore.createIndex("playerName", "playerName", { unique: false });
  objectPlayerDataStore.createIndex("playerColor", "playerColor", { unique: false });

  const objectAccsStore = dbUp.createObjectStore("playerAccessoryData", { keyPath: "playerId" });
  objectAccsStore.createIndex("birdColor", "birdColor", { unique: false });
  objectAccsStore.createIndex("headAccessory", "headAccessory", { unique: false });
  objectAccsStore.createIndex("handAccessory", "handAccessory", { unique: false });

  const objectLevelDataStore = dbUp.createObjectStore("playerLevelData", { keyPath: "playerId" });
  objectLevelDataStore.createIndex("completeLevel1", "completeLevel1", { unique: false });
  objectLevelDataStore.createIndex("completeLevel2", "completeLevel2", { unique: false });
  objectLevelDataStore.createIndex("completeLevel3", "completeLevel3", { unique: false });
  objectLevelDataStore.createIndex("highscoreLevel1", "highscoreLevel1", { unique: false });
  objectLevelDataStore.createIndex("highscoreLevel2", "highscoreLevel2", { unique: false });
  objectLevelDataStore.createIndex("highscoreLevel3", "highscoreLevel3", { unique: false });
  objectLevelDataStore.createIndex("highscoreEndless", "highscoreEndless", { unique: false });
  objectLevelDataStore.createIndex("completeLevelDate1", "completeLevelDate1", { unique: false });
  objectLevelDataStore.createIndex("completeLevelDate2", "completeLevelDate2", { unique: false });
  objectLevelDataStore.createIndex("completeLevelDate3", "completeLevelDate3", { unique: false });
  objectLevelDataStore.createIndex("endlessDate", "endlessDate", { unique: false });
  


  const objectSettingsStore = dbUp.createObjectStore("playerSettingData", { keyPath: "playerId" });
  objectSettingsStore.createIndex("easyMode", "easyMode", { unique: false });
  objectSettingsStore.createIndex("showFps", "showFPs", { unique: false });
  objectSettingsStore.createIndex("capFps", "capFps", { unique: false });
  
};
request.onsuccess = (event) => {
  console.log("Success Opening")
  db = event.target.result;
  renderAllPlayer();
}

document.getElementsByClassName("edit-profile-delete-button")[0].addEventListener("click", (event) => {
  const playerId = (event.target.id).slice(0, -1);
  deletePlayerById(Number(playerId));
  switchProfileCreationButton(false, "edit")
});
document.getElementsByClassName("edit-profile-update-button")[0].addEventListener("click", (event) => {
  const playerId = (event.target.id).slice(0, -1);
  console.log(playerId);
  const newName = document.getElementById("input-name-edit").value;
  const newColor = document.getElementById("input-color-edit").value;


  updateProfile(Number(playerId), newName, newColor);
  renderAllPlayer();
  switchProfileCreationButton(false, "edit")

});


function renderPlayerById(pPlayerId) {
  db.transaction("players").objectStore("players")

    .get(Number(pPlayerId)).onsuccess = (event) => {
      const profileContainer = document.getElementById("player-profile-container");
      const color = event.target.result.playerColor;

      const elementProfile = document.createElement('button');
      elementProfile.className = "player-profile";
      elementProfile.style.backgroundColor = color;
      elementProfile.style.borderColor = getContrastYIQ(color);
      elementProfile.id = pPlayerId;
      elementProfile.onclick = profilePressed;

      const elementProfileNameSpan = document.createElement('span');
      elementProfileNameSpan.className = "player-profile-name";
      elementProfileNameSpan.style.color = getContrastYIQ(color);
      elementProfileNameSpan.innerText = event.target.result.playerName;

      elementProfile.appendChild(elementProfileNameSpan);
      profileContainer.appendChild(elementProfile);
    };
}
function renderPlayerWithIdNameColor(pPlayerId, pName, pColor) {

  const profileContainer = document.getElementById("player-profile-container");

  const elementProfile = document.createElement('button');
  elementProfile.className = "player-profile";
  elementProfile.style.backgroundColor = pColor;
  elementProfile.style.borderColor = getContrastYIQ(pColor);
  elementProfile.id = pPlayerId;
  elementProfile.onclick = profilePressed;

  const elementProfileNameSpan = document.createElement('span');
  elementProfileNameSpan.className = "player-profile-name";
  elementProfileNameSpan.style.color = getContrastYIQ(pColor);
  elementProfileNameSpan.innerText = pName;

  elementProfile.appendChild(elementProfileNameSpan);
  profileContainer.appendChild(elementProfile);

}
function renderAllPlayer() {
  document.getElementById("player-profile-container").innerHTML = "";
  const objectStore = db.transaction("players").objectStore("players");

  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      renderPlayerWithIdNameColor(cursor.key, cursor.value.playerName, cursor.value.playerColor);
      cursor.continue();
    }
  };

}
function deletePlayerById(pPlayerId) {

  const requestPlayers = db.transaction(["players"], "readwrite")
    .objectStore("players")
    .delete(pPlayerId);

  requestPlayers.onsuccess = (event) => {
    const requestAccs = db.transaction(["playerAccessoryData"], "readwrite")
      .objectStore("playerAccessoryData")
      .delete(pPlayerId);

    requestAccs.onsuccess = (event) => {
      const requestLevelData = db.transaction(["playerLevelData"], "readwrite")
        .objectStore("playerLevelData")
        .delete(pPlayerId);

      requestLevelData.onsuccess = (event) => {
        const requestSettingData = db.transaction(["playerSettingData"], "readwrite")
          .objectStore("playerSettingData")
          .delete(pPlayerId);

        requestSettingData.onsuccess = (event) => {
          console.log("deleted")

        }

      }

    };

  };
  renderAllPlayer();
}

function createNewProfile(pName, pColor) {
  const transaction = db.transaction(["players"], "readwrite");

  transaction.onerror = (event) => {
    console.log("Error for adding player" + pName);
  };

  const objectStore = transaction.objectStore("players");
  const request = objectStore.add({ playerName: pName, playerColor: pColor });

  request.onsuccess = (event) => {
    const newPlayerId = request.result;
    console.log(`Player ${pName} added with id: ${newPlayerId}`);

    const levelDataTransaction = db.transaction(["playerLevelData"], "readwrite");
    const levelDataObjectStore = levelDataTransaction.objectStore("playerLevelData");
    const levelDataRequest = levelDataObjectStore.add(createNewPlayerLevelData(newPlayerId));

    levelDataTransaction.oncomplete = (event) => {
      console.log("LevelData done!");

      const accsTransaction = db.transaction(["playerAccessoryData"], "readwrite");
      const accsObjectStore = accsTransaction.objectStore("playerAccessoryData");
      const accsRequest = accsObjectStore.add(createNewPlayerAccsData(newPlayerId));

      accsTransaction.oncomplete = (event) => {
        console.log("Accs done!");

        const settingsTransaction = db.transaction(["playerSettingData"], "readwrite");
        const settingsObjectStore = settingsTransaction.objectStore("playerSettingData");
        const settingsRequest = settingsObjectStore.add(createNewPlayerSettingData(newPlayerId));

        settingsTransaction.oncomplete = (event) => {
          console.log("Settings done!");


          renderPlayerById(newPlayerId);

        };
        //renderPlayerById(newPlayerId);


      };


    };

    transaction.oncomplete = (event) => {
      console.log("Player done!");
    };
  }
}
function createNewPlayerLevelData(pPlayerId) {
  return {
    playerId: pPlayerId,
    completeLevel1: false,
    completeLevel2: false,
    completeLevel3: false,
    highscoreLevel1: 0,
    highscoreLevel2: 0,
    highscoreLevel3: 0,
    highscoreEndless: 0,
    completeLevelDate1: nullDate,
    completeLevelDate2: nullDate,
    completeLevelDate3: nullDate,
    endlessDate: nullDate


  }
}
function createNewPlayerAccsData(pPlayerId) {
  return {
    playerId: pPlayerId,
    birdColor: "blue",
    headAccessory: "none",
    handAccessory: "none"
  }
}
function createNewPlayerSettingData(pPlayerId) {
  return {
    playerId: pPlayerId,
    easyMode: false,
    showFps: false,
    capFps: true
  }
}



function profilePressed(event) {
  if (editMode) {
    openEditProfile(event.target.id);
  }
  else {
    
    sessionStorage.setItem("currentPlayerId", event.target.id);
    window.location.replace("level-selection.html");
  }

}

function saveProfileButton() {
  let playerName = document.getElementById("input-name-create").value;
  const playerColor = document.getElementById("input-color-create").value;
  if (playerName == "" || playerName === null) {
    playerName = "PlayerOne";
  }
  createNewProfile(playerName, playerColor);
  switchProfileCreationButton(false, "create");
  resetInputValues("create");
}


function addProfileButton() {
  switchProfileCreationButton(true, "create");
  setEditMode(false);

}
function switchProfileCreationButton(pValue, pName) {
  if (pValue) {
    document.getElementById(pName + "-profile-container").style.display = "block";
  } else {
    document.getElementById(pName + "-profile-container").style.display = "none";
    resetInputValues("create");
  }
}
function switchEditModeButton() {
  editMode = !editMode;
  setEditMode(editMode);
}
function setEditMode(pValue) {
  editMode = pValue;
  if (pValue) {
    document.getElementById("player-profile-container").style.opacity = 0.6;
    document.getElementById("edit-mode-button").innerText = "Done";
  }
  else {
    document.getElementById("player-profile-container").style.opacity = 1;
    document.getElementById("edit-mode-button").innerText = "Edit"

  }
}
function openEditProfile(pPlayerId) {
  document.getElementById("edit-profile-container").style.display = "block"
  db.transaction("players").objectStore("players")
    .get(Number(pPlayerId)).onsuccess = (event) => {
      const color = event.target.result.playerColor;
      const name = event.target.result.playerName;


      document.getElementById("input-name-edit").value = name;
      document.getElementById("input-color-edit").value = color;

      updateProfilePreview("color", "edit");
      updateProfilePreview("name", "edit");

      document.getElementsByClassName("edit-profile-delete-button")[0].id = pPlayerId + "d";
      document.getElementsByClassName("edit-profile-update-button")[0].id = pPlayerId + "u";

    }

  db.transaction("playerLevelData").objectStore("playerLevelData")
    .get(Number(pPlayerId)).onsuccess = (event) => {


      if (Boolean(event.target.result.completeLevel1)) {
        document.getElementById("edit-profile-level-1").innerText = "\u2713";
      }
      else {
        document.getElementById("edit-profile-level-1").innerText = "\u2716 Your Best: " + floorScore(event.target.result.highscoreLevel1);
      }
      if (Boolean(event.target.result.completeLevel2)) {
        document.getElementById("edit-profile-level-2").innerText = "\u2713";
      }
      else {
        document.getElementById("edit-profile-level-2").innerText = "\u2716 Your Best: " + floorScore(event.target.result.highscoreLevel2);
      }
      if (Boolean(event.target.result.completeLevel3)) {
        document.getElementById("edit-profile-level-3").innerText = "\u2713";
      }
      else {
        document.getElementById("edit-profile-level-3").innerText = "\u2716 Your Best: " + floorScore(event.target.result.highscoreLevel3);
      }



      document.getElementById("edit-profile-endless").innerText = floorScore(event.target.result.highscoreEndless / 60);

    }
}

function updateProfilePreview(pInputType, pName) {
  const elementProfileName = document.getElementById(pName + "-preview-profile-name");

  if (pInputType == "color") {
    const color = document.getElementById("input-color-" + pName).value;
    const elementProfile = document.getElementById(pName + "-preview-profile");

    elementProfile.style.backgroundColor = color;
    elementProfile.style.borderColor = getContrastYIQ(color);
    elementProfileName.style.color = getContrastYIQ(color);

  } else if (pInputType == "name") {
    const name = document.getElementById("input-name-" + pName).value;

    elementProfileName.innerText = name;
  }
}
function updateProfile(pPlayerId, pNewName, pNewColor) {
  const objectStore = db.transaction(["players"], "readwrite").objectStore("players");
  const request = objectStore.get(pPlayerId);
  request.onsuccess = (event) => {

    const data = event.target.result;

    data.playerName = pNewName;
    data.playerColor = pNewColor;

    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      // Do something with the error

    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!

    };
  };

}

function resetInputValues(pName) {
  document.getElementById("input-name-" + pName).value = "";
  document.getElementById("input-color-" + pName).value = "";
  document.getElementById(pName + "-preview-profile-name").innerText = "PlayerOne"
  document.getElementById(pName + "-preview-profile").removeAttribute("style");


}

function getContrastYIQ(hexcolor) {
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#101015' : '#e2e2e2';
}
function floorScore(pScore) {
  if(pScore === undefined) {
    return 0;
  }
  return Math.floor(pScore/60);
}