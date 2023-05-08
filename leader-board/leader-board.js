const dbName = "PlayerDataBase";
const request = indexedDB.open(dbName, 6);
let db;

request.onerror = (event) => {
  console.error("IndexDB is not allowed or version is to low.");
};

request.onsuccess = (event) => {
  db = event.target.result;
  fillScoreList();
  fillDateList();
  loadPlayerData();
}

let scoreList = new Array();

const dateList = new Array();


// Logic
function fillScoreList() {
  const objectStoreLD = db.transaction("playerLevelData").objectStore("playerLevelData");

  objectStoreLD.openCursor().onsuccess = (event) => {
    const cursorLD = event.target.result;
    if (cursorLD) {
      const highscore = Number(cursorLD.value.highscoreEndless);

      scoreList.push({ id: cursorLD.key, score: highscore });


      cursorLD.continue();
    } else {

      scoreList = scoreList.sort((a, b) => {
        return Number(b.score) - Number(a.score);
      });
      evaluateScoreList();
    }

  }
}
function evaluateScoreList() {
  let number;
  scoreList.forEach((idSc, index) => {
    db.transaction("players").objectStore("players")
      .get(Number(idSc.id)).onsuccess = (event) => {
        number = index + 1;
        renderPlayer(event.target.result.playerName, number, Math.floor(idSc.score / 60), event.target.result.playerColor);
      }

  });
}
function fillDateList() {
  const objectStoreLD = db.transaction("playerLevelData").objectStore("playerLevelData");

  objectStoreLD.openCursor().onsuccess = (event) => {
    const cursorLD = event.target.result;
    if (cursorLD) {


      dateList.push({
        id: cursorLD.key,
        date1: cursorLD.value.completeLevelDate1,
        date2: cursorLD.value.completeLevelDate2,
        date3: cursorLD.value.completeLevelDate3,
        score1: cursorLD.value.highscoreLevel1,
        score2: cursorLD.value.highscoreLevel2,
        score3: cursorLD.value.highscoreLevel3

      });



      cursorLD.continue();
    } else {
      evaluateDateList();
    }

  }
}
function evaluateDateList() {

  const sortedDateList1 = dateList.sort((a, b) => {
    return Number(b.date1) - Number(a.date1);
  });
  const sortedDateList2 = dateList.sort((a, b) => {
    return Number(b.date2) - Number(a.date2);
  });
  const sortedDateList3 = dateList.sort((a, b) => {
    return Number(b.date3) - Number(a.date3);
  });
  sortedDateList1.forEach((idDa1, index1) => {
    db.transaction("players").objectStore("players")
      .get(Number(idDa1.id)).onsuccess = (event) => {

        renderPlayerLevel(event.target.result.playerName, (index1 + 1), idDa1.score1,
          idDa1.date1, event.target.result.playerColor, 1);
      }
  });
  sortedDateList2.forEach((idDa2, index1) => {
    db.transaction("players").objectStore("players")
      .get(Number(idDa2.id)).onsuccess = (event) => {

        renderPlayerLevel(event.target.result.playerName, (index1 + 1), idDa2.score2,
          idDa2.date2, event.target.result.playerColor, 2);
      }
  });
  sortedDateList3.forEach((idDa3, index1) => {
    db.transaction("players").objectStore("players")
      .get(Number(idDa3.id)).onsuccess = (event) => {

        renderPlayerLevel(event.target.result.playerName, (index1 + 1), idDa3.score3,
          idDa3.date3, event.target.result.playerColor, 3);
      }
  });



}

// Visual
function renderPlayer(pName, pNumber, pScore, pColor) {
  const listContainer = document.getElementById("endless-container");
  const divListItem = document.createElement("div");
  divListItem.className = "list-item";
  divListItem.style.backgroundColor = pColor;
  divListItem.style.color = getContrastYIQ(pColor);
  divListItem.style.borderColor = getContrastYIQ(pColor);

  const spanListNumber = document.createElement("span");
  spanListNumber.innerText = pNumber + ".";

  const spanListPlayer = document.createElement("span");
  spanListPlayer.innerText = pName;

  const spanListScore = document.createElement("span");
  spanListScore.innerText = "Score: " + pScore;

  divListItem.appendChild(spanListNumber);
  divListItem.appendChild(spanListPlayer);
  divListItem.appendChild(spanListScore);

  listContainer.appendChild(divListItem);
}

function loadPlayerData() {
  const currentPlayerId = sessionStorage.getItem("currentPlayerId");

  if ((currentPlayerId === null)) {
    return;
  }

  db.transaction("players").objectStore("players")
    .get(Number(currentPlayerId)).onsuccess = (event) => {
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

function renderPlayerLevel(pName, pNumber, pScore,pDate, pColor, pLevel) {
  const listContainer = document.getElementById("level" + pLevel + "-container");
  const divListItem = document.createElement("div");

  let dateOrNC = new Date(pDate);

  if (dateOrNC.valueOf() === 0) {
    if(pScore === 0) {
      dateOrNC = "---";
    } else {
      dateOrNC = Math.floor(pScore/60);
    }
  } else {
    dateOrNC = dateOrNC.toLocaleDateString();
  }



  divListItem.className = "list-item";
  divListItem.style.backgroundColor = pColor;
  divListItem.style.color = getContrastYIQ(pColor);
  divListItem.style.borderColor = getContrastYIQ(pColor);

  const spanListNumber = document.createElement("span");
  spanListNumber.innerText = pNumber + ".";

  const spanListPlayer = document.createElement("span");
  spanListPlayer.innerText = pName;

  const spanListScore = document.createElement("span");
  spanListScore.innerText = dateOrNC;

  divListItem.appendChild(spanListNumber);
  divListItem.appendChild(spanListPlayer);
  divListItem.appendChild(spanListScore);

  listContainer.appendChild(divListItem);
}




// Helper Method
function getContrastYIQ(pHexColor) {
  const r = parseInt(pHexColor.substring(1, 3), 16);
  const g = parseInt(pHexColor.substring(3, 5), 16);
  const b = parseInt(pHexColor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#101015' : '#e2e2e2';
}



