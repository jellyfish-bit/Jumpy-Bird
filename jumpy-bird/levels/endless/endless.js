const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const screenWidth = canvas.clientWidth;
const screenHeight = canvas.clientHeight;

const savedHighScore = localStorage.getItem('highscore');
let birdColor = localStorage.getItem('birdColor');
if(birdColor  === null) {
  birdColor = "blue";
}


// Accessories
let accsStats = JSON.parse(localStorage.getItem("accessoryStats"));

if(accsStats === null) {
  accsStats = {
    handName: "none",
    headName: "none",
    bonusLives: 0,
    staffUsage: 0,
    shieldDurability: 0,
    scoreMultiplier: 1.0,
    accelerationDecrease: 1.0,
  };
}
let headAccessory = accsStats.headName;
let handAccessory = accsStats.handName;
const bonusLives = accsStats.bonusLives;
let staffUsage = accsStats.staffUsage;
let shieldDurability = accsStats.shieldDurability;
const scoreMultiplier = accsStats.scoreMultiplier;
const accelerationDecrease = accsStats.accelerationDecrease;
//accs end


let gameLives = 1 + bonusLives;
let gameStarted = false;
let animationFrameHandle = 0;
let gameEasyMode = false;
let gameModeName = "Normal";

const pipes = [];
const pipeCount = 3;
let pipeSpeed = -2;

let score = 0;
let highScore = 0;
if(savedHighScore != null) {
  highScore = savedHighScore;
}

let flapCount = 15;
let birdCurrentColor = 0;
const flapTime = 15;


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
    holeHeight: 150,
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
      let tempUpperHeight = 100 + 40 * this.level;
      let tempLowerHeight = screenHeight - (tempUpperHeight + this.holeHeight);
      if(this.isTopDestroyed) {
        tempUpperHeight = 5;
      }
      if(this.isBottomDestroyed) {
        tempLowerHeight = 5;
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
          y2: (screenHeight- this.getPipeHeights()[1]) + this.getPipeHeights()[1]
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
    }
  });
}

//bird
const bird = {
  x: screenWidth/6,
  y: screenHeight/4,
  speed: 0,
  radius: 20,
  gravity: 0.4,
  flapForce: -7,
  staffX: this.x +42,
  staffY: this.y +25,
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
    if(this.y > screenHeight- this.radius) {
        this.y = screenHeight- this.radius;
    }
    else if(this.y < this.radius) {
        this.y = this.radius;
    }
    if(flapCount < flapTime) {
      flapCount++;
    }
    this.staffX = this.x+42;
    this.staffY = this.y+25;
  },
  draw() {
    /*ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();*/
    if(flapCount < flapTime) {
      ctx.drawImage(birdColorFlapImage, this.x-25, this.y-18, 51, 36);
    } else {
      ctx.drawImage(birdColorImage, this.x-25, this.y-18, 51, 36);
    }
    if(headAccessory != "none") {
      ctx.drawImage(headAccessoryImage, this.x-25, this.y-38, 51, 36);
    }
    if(handAccessory != "none" && staffUsage > 0) {
      ctx.drawImage(handAccessoryImage, this.x-27, this.y+4, 102, 36);
      /*ctx.beginPath();
      ctx.arc(this.staffX, this.staffY, this.staffRadius, 0, 2 * Math.PI);
      ctx.stroke();*/
      
    }
    
  },
  reset() {
    this.x = screenWidth/6;
    this.y = screenHeight/4;
    this.staffX = this.x +42;
    this.staffY = this.y +25;
  },
  checkStaffOverlap(X1, Y1, X2, Y2) {
    let Xn = Math.max(X1, Math.min(this.staffX, X2));
    let Yn = Math.max(Y1, Math.min(this.staffY, Y2));
    let Dx = Xn - this.staffX;
    let Dy = Yn - this.staffY;
    return (Dx * Dx + Dy * Dy) <= this.staffRadius * this.staffRadius;
  },
};

beforeGameStart();

birdColorImage.addEventListener("load", (e) => {
  bird.draw();
});
if(headAccessory != "none") {
  headAccessoryImage.addEventListener("load", (e) => {
   bird.draw();
  });
}
if(handAccessory != "none") {
  handAccessoryImage.addEventListener("load", (e) => {
   bird.draw();
  });
}




// Key Input
document.addEventListener('keydown', function(event) {
  
  if (!gameStarted) {
    gameStarted = true;
    animationFrameHandle = window.requestAnimationFrame(loop);
  /*} 
  else if(event.key == "e") {
    if(gameEasyMode) {
      updatePipeHoleSize(150);
      gameModeName = 'Normal';
      drawMode();
      gameEasyMode = false;
    
    } else {
      updatePipeHoleSize(350);
      gameModeName = 'Easy';
      drawMode()
      gameEasyMode = true;
    }*/
  } else {
    bird.flap();
  }
}, false);

function restartButton() {
  pipes.forEach(pipe => {
    pipe.resetPipe();
  });
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  beforeGameStart();

}

// Game Logic
function loop() {
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  bird.update();
  bird.draw();
  drawMode(!gameEasyMode);
  drawCurrentLives(4, 5, 10);
  score += calcScoreIncreas();
  
  
  for (let i = 0; i < pipeCount; i++) {
    pipes[i].draw();
    pipes[i].update();
    pipes[i].updateSpeed(calcPipeSpeed(score));
    const upperLowerPipe = pipes[i].getPipes();
    const upperPipe = upperLowerPipe[0];
    const lowerPipe = upperLowerPipe[1];

    
    
    if(staffUsage > 0) {
      if(bird.checkStaffOverlap(upperPipe.x1, upperPipe.y1, upperPipe.x2, upperPipe.y2)) {
        pipes[i].destroyTop();
        staffUsage--;
      }
      if(bird.checkStaffOverlap(lowerPipe.x1, lowerPipe.y1, lowerPipe.x2, lowerPipe.y2)) {
        pipes[i].destroyBottom();
        staffUsage--;
      }
    }
    
    //lost
    if (bird.checkOverlap(upperPipe.x1, upperPipe.y1, upperPipe.x2, upperPipe.y2)
    || bird.checkOverlap(lowerPipe.x1, lowerPipe.y1, lowerPipe.x2, lowerPipe.y2)
    || bird.y > screenHeight || bird.y < 0) {
      if(gameLives > 1) {
        pipes.forEach(pipe => {
          pipe.destroyBottom();
          pipe.destroyTop();
        });
        gameLives--;
      }
      else {
        window.cancelAnimationFrame(animationFrameHandle);
        animationFrameHandle = undefined;
        gameOver();
        return;
      }
    }

    
  }

  updateHighScore();
  updateTopInfo();
  animationFrameHandle = window.requestAnimationFrame(loop);
}
function updateHighScore() {
  if(score > highScore) {
    highScore = score;
  }
  saveHighScore();
}
function saveHighScore() {
  localStorage.setItem('highscore', highScore);
}
function gameOver() {
  updateHighScore();
  updateTopInfo()

  updateEndMenu();
  clearLives(4,5, 10);
  document.getElementById('end-menu').style.display = "block";

  pipes.forEach(pipe => {
    pipe.isBottomDestroyed = false;
    pipe.isTopDestroyed = false;
  });
  
  score = 0;
  gameStarted = false;
}

function updatePipeHoleSize(pSize) {
  pipes.forEach(pipe => {
    pipe.holeHeight = pSize;
  });
}
//helper method
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function floorScore(pScore) {
  return Math.floor(pScore/60);
}
function calcPipeSpeed(pScore) {
  return -(1 + pScore/(600*accelerationDecrease));
}
function calcScoreIncreas() {
  return (1 * scoreMultiplier);

}

function updateTopInfo() {
  document.getElementById('score-top').innerHTML = "Score: " + Math.floor(score/60);
  document.getElementById('highscore-top').innerHTML = "Highscore: " + Math.floor(highScore/60);

}

function beforeGameStart() {
  drawGameStart();

  drawMode(true);
  drawCurrentLives(4, 5, 10);
  updateTopInfo();

  bird.reset();
  bird.draw();

  
  document.getElementById('end-menu').style.display = "none";
}

function updateEndMenu() {
  document.getElementById("end-menu-score").innerHTML = floorScore(score);
  document.getElementById("end-menu-highscore").innerHTML = floorScore(highScore);

}





// Visual
function drawGameStart() {
  ctx.font = "48px serif";
  ctx.fillStyle = "black";
  ctx.fillText("Press any key to start", 50, screenHeight/2);
  ctx.fillStyle = "rgb(60,60,60)";
  ctx.font = "26px serif";
  ctx.fillText("Your Highscore: " + Math.floor(highScore/60), 150, screenHeight/2 +30)
   

}

function drawMode() {
  ctx.clearRect(0, screenHeight-30, 75, 30);
  ctx.font = "20px serif";
  ctx.fillStyle = "gray";
  ctx.fillText(gameModeName , 10, screenHeight-10);
}

function drawCurrentLives(pScale, pStart, pDistance) {
  
  for(let i = 0;i< gameLives;i++) {
    drawHeart(pStart+i*(pDistance+pScale*4), 10, pScale, "red")
  }
}
function clearLives(pScale, pStart, pDistance) {
  ctx.clearRect(pStart-pScale, 10-pScale*1.5, (pScale*4+pDistance)*(gameLives),5*pScale)
}

function drawHeart(pX, pY, pScale, pColor) {
  ctx.save();
  ctx.beginPath();

  ctx.moveTo(pX, pY*1.1);
  ctx.lineTo(pX+pScale*4, pY*1.1)
  ctx.lineTo(pX+pScale*2, pY+pScale*3)
  ctx.lineTo(pX, pY*1.1)

  const sM = 1.05;
  ctx.arc(pX+pScale*sM, pY, pScale*sM, 0, Math.PI*2);
  ctx.arc(pX+pScale*4-pScale*sM, pY, pScale*sM, 0, Math.PI*2);

  ctx.strokeStyle = "black"
  ctx.stroke();


  ctx.fillStyle = pColor;

  ctx.fill()

  ctx.closePath();

  ctx.restore();

}