const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
//const screenWidthS = canvas.clientWidth;
//const screenHeightS = canvas.clientHeight;

const screenWidth = 680;
const screenHeight = 640;

const dbName = "PlayerDataBase";
const request = indexedDB.open(dbName, 6);
const playerId = Number(sessionStorage.getItem("currentPlayerId"));
let db;

request.onerror = (event) => {
  console.error("IndexDB is not allowed");
};



// Accessories
let accsStats = JSON.parse(sessionStorage.getItem("accessoryStats"));

if (accsStats === null) {
  accsStats = {
    colorBird: "blue",
    handName: "none",
    headName: "none",
    bonusLives: 0,
    staffUsage: 0,
    shieldDurability: 0,
    scoreMultiplier: 1.0,
    accelerationDecrease: 1.0,
  };
}
let birdColor = accsStats.colorBird;
let headAccessory = accsStats.headName;
let handAccessory = accsStats.handName;
const bonusLives = accsStats.bonusLives;
let staffUsage = accsStats.staffUsage;
let shieldDurability = accsStats.shieldDurability;
let scoreMultiplier = accsStats.scoreMultiplier;
const accelerationDecrease = accsStats.accelerationDecrease;
//accs end
//set
let settings = {
  easyMode: false,
  showFps: false,
  capFps: true
}

let gameLives = 1 + bonusLives;
let gameStarted = false;
let canStartGame = true;
let animationFrameHandle = 0;

const pipes = [];

const dataElement = document.getElementById("level-info");
const levelNumber = Number(dataElement.getAttribute("data-levelid"));
const pipeCount = Number(dataElement.getAttribute("data-pipecount"));
const pipeGapSize = Number(dataElement.getAttribute("data-pipegap"));
const pipeSpeed = -(Number(dataElement.getAttribute("data-levelspeed")) - (accelerationDecrease - 1) / 2);
const endscore = Number(dataElement.getAttribute("data-endscore"));
let isEndless = false;
if (levelNumber === 0) {
  isEndless = true;
}


//dataElement.innerHTML = `LI ${levelNumber}, PC ${pipeCount}, PG ${pipeGapSize}, LS ${pipeSpeed}, ES ${endscore}`;

let score = 0;
let bestScore = 0;

let flapCount = 15;
let birdCurrentColor = 0;
const flapTime = 15;

let listLevelHighcore = [0, 0, 0];
request.onsuccess = (event) => {
  console.log("Success Opening")
  db = event.target.result;

  loadLevelData();
  loadSettingData();
}


/*const birdColorImage = new Image();
birdColorImage.src = "../../images/" + birdColor +"_flappy_bird.png";

const birdColorFlapImage = new Image();
birdColorFlapImage.src = "../../images/" + birdColor +"_flappy_bird_flap.png";*/
const birdColorImage = document.getElementById(birdColor + "_bird");
const birdColorFlapImage = document.getElementById(birdColor + "_bird_flap");

const headAccessoryImage = document.getElementById(headAccessory + "-head");
const handAccessoryImage = document.getElementById(handAccessory + "-hand");



//Pipes
for (let i = 0; i < pipeCount; i++) {
  pipes.push({
    x: screenWidth + i * (screenWidth + 50) / pipeCount,
    width: 50,
    holeHeight: pipeGapSize,
    level: getRandomInt(1, 7),
    speed: pipeSpeed,
    destroyedTop: false,
    destroyedBottom: false,
    draw() {
      ctx.fillStyle = "darkgreen";
      const upperHeight = this.getPipeHeights()[0];
      const lowerHeight = this.getPipeHeights()[1];

      ctx.fillRect(this.x, 0, this.width, upperHeight);
      ctx.fillRect(this.x, screenHeight - lowerHeight, this.width, lowerHeight);
    },
    update() {
      this.x += this.speed;
      if (this.x < -this.width) {
        this.x = screenWidth;
        this.level = getRandomInt(1, 7);
        this.isTopDestroyed = false;
        this.isBottomDestroyed = false;

      }
    },
    getPipeHeights() {
      let tempUpperHeight = (screenHeight/4) + 40 * this.level;
      let tempLowerHeight = screenHeight - (tempUpperHeight + this.holeHeight);
      if (this.isTopDestroyed) {
        tempUpperHeight = 10;
      }
      if (this.isBottomDestroyed) {
        tempLowerHeight = 10;
      }
      return [
        tempUpperHeight,
        tempLowerHeight
      ];
    },
    getPipes() {
      return [{ // obere Pipe
        x1: this.x,
        y1: 0,
        x2: this.x + this.width,
        y2: this.getPipeHeights()[0],
      },
      { // untere Pipe
        x1: this.x,
        y1: screenHeight - this.getPipeHeights()[1],
        x2: this.x + this.width,
        y2: (screenHeight - this.getPipeHeights()[1]) + this.getPipeHeights()[1]
      }
      ];
    },
    resetPipe() {
      this.x = screenWidth + i * (screenWidth + 50) / pipeCount;
    },
    updateSpeed(pSpeed) {
      this.speed = pSpeed;
    },
    destroyTop() {
      this.isTopDestroyed = true;
    },
    destroyBottom() {
      this.isBottomDestroyed = true;
    },
    updateGapSize(pHeight) {
      this.holeHeight = pHeight;
    }
  });
}

//bird
const bird = {
  x: screenWidth / 6,
  y: screenHeight / 4,
  speed: 0,
  radius: 20,
  gravity: 0.4,
  flapForce: -7,
  staffX: this.x + 42,
  staffY: this.y + 25,
  staffRadius: 16,
  checkOverlap(X1, Y1, X2, Y2) {
    let Xn = Math.max(X1, Math.min(this.x, X2));
    let Yn = Math.max(Y1, Math.min(this.y, Y2));
    let Dx = Xn - this.x;
    let Dy = Yn - this.y;
    return (Dx * Dx + Dy * Dy) <= this.radius * this.radius;
  },
  flap() {
    if (this.y <= 0) return;
    this.speed = this.flapForce;
    flapCount = 0;
  },
  update() {
    this.speed += this.gravity;
    this.y += this.speed;
    if (this.y > screenHeight - this.radius) {
      this.y = screenHeight - this.radius;
    }
    else if (this.y < this.radius) {
      this.y = this.radius;
    }
    if (flapCount < flapTime) {
      flapCount++;
    }
    this.staffX = this.x + 42;
    this.staffY = this.y + 25;
  },
  draw() {
    /*ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();*/
    if (flapCount < flapTime) {
      ctx.drawImage(birdColorFlapImage, this.x - 25, this.y - 18, 51, 36);
    } else {
      ctx.drawImage(birdColorImage, this.x - 25, this.y - 18, 51, 36);
    }
    if (headAccessory != "none") {
      ctx.drawImage(headAccessoryImage, this.x - 25, this.y - 38, 51, 36);
    }
    if (handAccessory != "none" && staffUsage > 0) {
      ctx.drawImage(handAccessoryImage, this.x - 27, this.y + 4, 102, 36);
      /*ctx.beginPath();
      ctx.arc(this.staffX, this.staffY, this.staffRadius, 0, 2 * Math.PI);
      ctx.stroke();*/

    }

  },
  reset() {
    this.x = screenWidth / 6;
    this.y = screenHeight / 4;
    this.staffX = this.x + 42;
    this.staffY = this.y + 25;
  },
  checkStaffOverlap(X1, Y1, X2, Y2) {
    let Xn = Math.max(X1, Math.min(this.staffX, X2));
    let Yn = Math.max(Y1, Math.min(this.staffY, Y2));
    let Dx = Xn - this.staffX;
    let Dy = Yn - this.staffY;
    return (Dx * Dx + Dy * Dy) <= this.staffRadius * this.staffRadius;
  },
};


birdColorImage.addEventListener("load", (e) => {
  bird.draw();
});
if (headAccessory != "none") {
  headAccessoryImage.addEventListener("load", (e) => {
    bird.draw();
  });
}
if (handAccessory != "none") {
  handAccessoryImage.addEventListener("load", (e) => {
    bird.draw();
  });
}




// Key Input
document.addEventListener('keydown', function (event) {

  startGame();
}, false);
document.addEventListener('touchstart', function (event) {
  startGame();

}, false);

function startGame() {
  if (!gameStarted && canStartGame) {
    gameStarted = true;
    canStartGame = false;
    animationFrameHandle = window.requestAnimationFrame(loop);
  } else {
    bird.flap();
  }
}
function restartButton() {
  pipes.forEach(pipe => {
    pipe.resetPipe();
  });
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  beforeGameStart();
  canStartGame = true;

}
function nextLevelButton(pLink) {
  window.location.href = pLink + ".html";
}

let secondsPassed, ticks;
let previousTimeStamp;
let fps;


// Game Logic
function loop(timeStamp) {
  if (timeStamp - previousTimeStamp >= 16 || previousTimeStamp === undefined || !settings.capFps) {
    secondsPassed = (timeStamp - previousTimeStamp) / 1000;

    previousTimeStamp = timeStamp;

    ctx.clearRect(0, 0, screenWidth, screenHeight);
    bird.update();
    bird.draw();
    drawMode(settings.easyMode);
    drawCurrentLives(4, 5, 10);

    score += calcScoreIncreas();
    backgroundAnimation(score);
    //won
    if (score > endscore * 60 && !isEndless) {
      window.cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = undefined;
      gameEnd(true);

      return;
    }

    for (let i = 0; i < pipeCount; i++) {
      pipes[i].draw();
      pipes[i].update();
      if (isEndless) {
        pipes[i].updateSpeed(calcPipeSpeed(score));
      };
      const upperLowerPipe = pipes[i].getPipes();
      const pipeI = pipes[i];
      const upperPipe = upperLowerPipe[0];
      const lowerPipe = upperLowerPipe[1];



      if (staffUsage > 0) {
        if (bird.checkStaffOverlap(upperPipe.x1, upperPipe.y1, upperPipe.x2, upperPipe.y2)) {
          staffUsage--;
        }
        if (bird.checkStaffOverlap(lowerPipe.x1, lowerPipe.y1, lowerPipe.x2, lowerPipe.y2)) {
          pipes[i].destroyBottom();
          staffUsage--;
        }
      }

      //lost
      if (bird.checkOverlap(upperPipe.x1, upperPipe.y1, upperPipe.x2, upperPipe.y2)
        || bird.checkOverlap(lowerPipe.x1, lowerPipe.y1, lowerPipe.x2, lowerPipe.y2)
        || bird.y > screenHeight || bird.y < 0) {
        if (gameLives > 1) {
          pipes.forEach(pipe => {
            pipe.destroyBottom();
            pipe.destroyTop();
          });
          gameLives--;
        }
        else {
          window.cancelAnimationFrame(animationFrameHandle);
          animationFrameHandle = undefined;
          gameEnd(false);
          return;
        }
      }
    }

    updateBestScore();
    updateTopInfo();


    fps = Math.round(1 / secondsPassed);
    drawFps(settings.showFps, fps);

  }
  window.requestAnimationFrame(loop);
}
function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
  }

}
function gameEnd(pWon) {
  updateBestScore();
  updateTopInfo()



  clearLives(4, 5, 10);
  if (pWon) {
    document.getElementById('won-menu').style.display = "block";
    saveLevelComplete();
  } else {
    document.getElementById('lost-menu').style.display = "block";
    updateLostMenu();
    saveBestScore();
  }

  pipes.forEach(pipe => {
    pipe.isBottomDestroyed = false;
    pipe.isTopDestroyed = false;
  });



  score = 0;
  gameStarted = false;
}

//helper method
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function floorScore(pScore) {
  return Math.floor(pScore / 60);
}
function calcPipeSpeed(pScore) {
  return -(1 + pScore / (600 * accelerationDecrease));
}
function calcScoreIncreas() {
  return (1 * scoreMultiplier);

}

function beforeGameStart() {
  gameLives = 1 + bonusLives;
  drawGameStart();

  drawMode(settings.easyMode);
  drawCurrentLives(4, 5, 10);
  updateTopInfo();
  resetAccs();

  bird.reset();
  bird.draw();

  document.getElementById('lost-menu').style.display = "none";
  document.getElementById('won-menu').style.display = "none";
}
function updateTopInfo() {
  document.getElementById('score-top').innerHTML = floorScore(score);
  document.getElementById('highscore-top').innerHTML = floorScore(bestScore);

}
function updateLostMenu() {
  document.getElementById("end-menu-score").innerHTML = floorScore(score);
  document.getElementById("end-menu-highscore").innerHTML = floorScore(bestScore);

}
function resetAccs() {
  staffUsage = accsStats.staffUsage;
}

function saveBestScore() {

  const objectStore = db.transaction(["playerLevelData"], "readwrite")
    .objectStore("playerLevelData");

  const request = objectStore.get(Number(playerId));
  request.onsuccess = (event) => {

    const data = event.target.result;


    if (levelNumber === 0) {
      data.highscoreEndless = bestScore;
    } else if (levelNumber === 1) {
      data.highscoreLevel1 = bestScore;
    } else if (levelNumber === 2) {
      data.highscoreLevel2 = bestScore;
    } else if (levelNumber === 3) {
      data.highscoreLevel3 = bestScore;
    }


    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      // Do something with the error

    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!

    };
  };
}
function saveLevelComplete() {
  const objectStore = db.transaction(["playerLevelData"], "readwrite")
    .objectStore("playerLevelData");

  const request = objectStore.get(Number(playerId));
  request.onsuccess = (event) => {

    const data = event.target.result;
    const currentDate = Date.now();


    if (levelNumber === 1) {
      data.completeLevel1 = true;
      data.highscoreLevel1 = bestScore;
      data.completeLevelDate1 = currentDate;

    } else if (levelNumber === 2) {
      data.completeLevel2 = true;
      data.highscoreLevel2 = bestScore;
      data.completeLevelDate2 = currentDate;


    } else if (levelNumber === 3) {
      data.completeLevel3 = true;
      data.highscoreLevel3 = bestScore;
      data.completeLevelDate3 = currentDate;


    }

    const requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
      // Do something with the error

    };
    requestUpdate.onsuccess = (event) => {
      // Success - the data is updated!

    };
  };
}


function loadLevelData() {
  db.transaction("playerLevelData").objectStore("playerLevelData")
    .get(playerId).onsuccess = (event) => {


      listLevelHighcore[0] = event.target.result.highscoreEndless;
      listLevelHighcore[1] = event.target.result.highscoreLevel1;
      listLevelHighcore[2] = event.target.result.highscoreLevel2;
      listLevelHighcore[3] = event.target.result.highscoreLevel3;

      bestScore = listLevelHighcore[levelNumber];

      beforeGameStart();
    }
}
function loadSettingData() {
  db.transaction("playerSettingData").objectStore("playerSettingData")
    .get(playerId).onsuccess = (event) => {

      settings.easyMode = event.target.result.easyMode;
      settings.showFps = event.target.result.showFps;
      settings.capFps = event.target.result.capFps;
      if (settings.easyMode) {
        applyEasyMode();
      }
    }
}
function applyEasyMode() {
  gameLives++;
  pipes.forEach(pipe => {
    pipe.updateGapSize(pipeGapSize * 1.5);
  });
  drawCurrentLives(4, 5, 10);
  scoreMultiplier++;

}

// Visual
function backgroundAnimation(pScore) {
  //loops at -1620px
  canvas.style.backgroundPositionX = -(pScore/10) + "px";
  
}

function drawGameStart() {
  ctx.font = "48px serif";
  ctx.fillStyle = "rgb(158, 158, 158)";
  ctx.fillText("Press any key to start", 50, screenHeight / 2);
  ctx.fillStyle = "rgb(100, 100, 100)";
  ctx.font = "26px serif";
  if (levelNumber == 0) {
    ctx.fillText("Your Best: " + floorScore(bestScore), 150, screenHeight / 2 + 30);
  } else {
    ctx.fillText("Your Best: " + floorScore(bestScore) + "/" + endscore, 150, screenHeight / 2 + 30)
  }

}

function drawMode(pValue) {
  if (!pValue) {
    return;
  }
  ctx.clearRect(0, screenHeight - 30, 75, 30);
  ctx.font = "20px serif";
  ctx.fillStyle = "gray";
  ctx.fillText("Easy Mode", 10, screenHeight - 10);
}

function drawCurrentLives(pScale, pStart, pDistance) {

  for (let i = 0; i < gameLives; i++) {
    drawHeart(pStart + i * (pDistance + pScale * 4), 10, pScale, "red")
  }
}
function clearLives(pScale, pStart, pDistance) {
  ctx.clearRect(pStart - pScale, 10 - pScale * 1.5, (pScale * 4 + pDistance) * (gameLives), 5 * pScale)
}

function drawHeart(pX, pY, pScale, pColor) {
  ctx.save();
  ctx.beginPath();

  ctx.moveTo(pX, pY * 1.1);
  ctx.lineTo(pX + pScale * 4, pY * 1.1)
  ctx.lineTo(pX + pScale * 2, pY + pScale * 3)
  ctx.lineTo(pX, pY * 1.1)

  const sM = 1.05;
  ctx.arc(pX + pScale * sM, pY, pScale * sM, 0, Math.PI * 2);
  ctx.arc(pX + pScale * 4 - pScale * sM, pY, pScale * sM, 0, Math.PI * 2);

  ctx.strokeStyle = "black"
  ctx.stroke();


  ctx.fillStyle = pColor;

  ctx.fill()

  ctx.closePath();

  ctx.restore();

}

function drawFps(pValue, pFps) {
  if (!pValue) {
    return;
  }
  if (pFps >= 58 && pFps <= 63) {
    pFps = 60;
  }
  ctx.font = "12px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("FPS:" + pFps, screenWidth - 50, 20);
}