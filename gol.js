'use strict';

const CANVASCONTAINER = document.getElementById('canvas')
var context = null
var canvas = null
const TILESIZE = 15;
var ROWNUM = null
const SPAWNERPOSITIONS = [8, 10, 20, 25, 30, 33]
const SPAWNERS = []
const gameMap = [];
let snek1 = null
let snek2 = null
let spawnInterval = null
let drawInterval = null
let loseCount = {
  player1: 0,
  player2: 0
}


//     ***************   TILE class START  ***************

class Tile {
  constructor(x, y, fillColor) {
    this.x = x;
    this.y = y;
    this.fillColor = fillColor;
    this.occupied = 0;
    this.neighbourCount = 0
  }

  getCords() {
    return {
      x: this.x * TILESIZE,
      y: this.y * TILESIZE
    }
  }

  fillCell() {
    context.fillStyle = this.fillColor;
    context.fillRect(this.x * TILESIZE, this.y * TILESIZE, TILESIZE, TILESIZE);
  }

  clearCell() {
    this.occupied = 0
    context.strokeStyle = 'grey';
    context.strokeRect(this.x * TILESIZE, this.y * TILESIZE, TILESIZE, TILESIZE);
  }

  occupyCell(what, color) {
    this.occupied = what;
    this.fillColor = color;
    this.fillCell()
  }

  getCount(map) {
    let count = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let a = this.x + i;
        let b = this.y + j;
        if (a > -1 && b > -1 && a < ROWNUM && b < ROWNUM) {
          if (map[a][b].occupied === 1) {
            count++
          }
        }
      }
    }
    return count;
  }
}

class SpawnerTile extends Tile {
  constructor(x, y, fillColor) {
    super(x, y, fillColor)
  }

  clearCell() {
    this.occupied = 0
    context.fillStyle = 'black';
    context.fillRect(this.x * TILESIZE, this.y * TILESIZE, TILESIZE, TILESIZE);
  }

  spawn(generator) {
    let randInt = Math.floor(Math.random() * Math.floor(2));
    if (randInt === 1) {
      generator.spawnRandom(this.x, this.y)
    }
  }
}

//     ***************   SNEK class START  ***************

class Snek {
  constructor(x, y, fillColor, actionKeys) {
    this.length = 4
    this.positions = []
    for (let i=0; i < this.length; i++) {
      this.positions.push({x: x, y: y - i})
    }
    this.fillColor = fillColor;
    this.actionKeys = actionKeys
    this.newDirection = actionKeys[0]
    this.direction = actionKeys[0]
    this.move()
  }

  move() {
    this.validateDirection()
    this.positions.unshift(Object.assign({}, this.positions[0]))
    let tail = this.positions[this.length]
    let head = this.positions[0]
    gameMap[tail.x][tail.y].clearCell()
    switch(this.direction) {
      case this.actionKeys[0]:
        head.y -= 1;
        break;
      case this.actionKeys[1]:
        head.x -= 1;
        break;
      case this.actionKeys[2]:
        head.y +=1;
        break;
      case this.actionKeys[3]:
        head.x += 1;
        break;
      default:
        console.log('move error');
    }
    this.validatePos(head)
    if (gameMap[head.x][head.y].occupied !== 0) {
      gameOver(this.fillColor)
    }
    if (this.fillColor ==='red') {
      gameMap[head.x][head.y].occupyCell(2, this.fillColor)
    } else if (this.fillColor === 'green'){
      gameMap[head.x][head.y].occupyCell(3, this.fillColor)
    }
  }

  validatePos(head) {
    if (head.x < 0) {
      head.x = ROWNUM - 1
    } else if (head.y < 0) {
      head.y = ROWNUM - 1
    } else if (head.x === ROWNUM) {
      head.x = 0
    } else if (head.y === ROWNUM) {
      head.y = 0
    }
  }

  validateDirection() {

    switch(this.direction) {
      case this.actionKeys[0]:
      if (this.newDirection !== this.actionKeys[2]) {
        this.direction = this.newDirection;
        }
        break;
        case this.actionKeys[1]:
        if (this.newDirection !== this.actionKeys[3]) {
          this.direction = this.newDirection;
        }
        break;
        case this.actionKeys[2]:
        if (this.newDirection !== this.actionKeys[0]) {
          this.direction = this.newDirection;
        }
        break;
      case this.actionKeys[3]:
      if (this.newDirection !== this.actionKeys[1]) {
          this.direction = this.newDirection;
        }
        break;
      default:
        console.log('move error');
    }
  }

  getDirection(key) {
    if (this.actionKeys.includes(key)) {
      this.newDirection = key
    }
  }
}

//     ***************   SNEK class END  ***************

//     ***************   GENERATOR class START  ***************

class Generators {
  constructor (map) {
    this.map = map
  }

  spawnRandom(x, y) {
    let randInt = Math.floor(Math.random() * Math.floor(5));
    switch(randInt) {
      case 0:
        this.blinker(x, y)
        break;
      case 1:
        this.glider(x, y)
        break;
      case 2:
        this.glider2(x, y)
        break;
      case 3:
        this.pentomino(x, y)
        break;
      case 3:
        this.toad(x, y)
        break;
    }

  }

  blinker(x, y) {
    this.map[x][y].occupyCell(1, 'blue' );
    this.map[x + 1][y].occupyCell(1, 'blue' );
    this.map[x + 2][y].occupyCell(1, 'blue' );
  }

  glider(x, y) {
    this.map[x][y].occupyCell(1, 'blue' );
    this.map[x + 1][y].occupyCell(1, 'blue' );
    this.map[x + 2][y].occupyCell(1, 'blue' );
    this.map[x + 2][y + 1].occupyCell(1, 'blue' );
    this.map[x + 1][y + 2].occupyCell(1, 'blue' );
  }

  glider2(x, y) {
    this.map[x][y].occupyCell(1, 'blue' );
    this.map[x - 1][y].occupyCell(1, 'blue' );
    this.map[x - 2][y].occupyCell(1, 'blue' );
    this.map[x - 2][y - 1].occupyCell(1, 'blue' );
    this.map[x - 1][y - 2].occupyCell(1, 'blue' );
  }

  pentomino(x, y) {
    this.map[x][y].occupyCell(1, 'blue' );
    this.map[x - 1][y].occupyCell(1, 'blue' );
    this.map[x][y - 1].occupyCell(1, 'blue' );
    this.map[x][y + 1].occupyCell(1, 'blue' );
    this.map[x + 1][y + 1].occupyCell(1, 'blue' );
  }

  toad(x, y) {
    this.map[x][y].occupyCell(1, 'blue' );
    this.map[x][y + 1].occupyCell(1, 'blue' );
    this.map[x + 1][y + 2].occupyCell(1, 'blue' );
    this.map[x + 2][y - 1].occupyCell(1, 'blue' );
    this.map[x + 3][y + 1].occupyCell(1, 'blue' );
    this.map[x + 3][y].occupyCell(1, 'blue' );
    this.map[x + 3][y + 1].occupyCell(1, 'blue' );
  }
}

//     ***************   GENERATOR class END  ***************


function createCanvas() {
  CANVASCONTAINER.innerHTML = '<canvas class="sol" width="600" height="600"></canvas>'
  canvas = document.querySelector('canvas')
  context = canvas.getContext("2d");
  ROWNUM = canvas.width / TILESIZE
}

function drawMap(gameMap) {
  for (let x = 0; x < ROWNUM; x++) {
    gameMap.push([])
    for (let y = 0; y < ROWNUM; y++) {
      if (SPAWNERPOSITIONS.includes(y)) {
        if (x === y ) {
          gameMap[x][y] = new SpawnerTile(x, y, 'white')
          SPAWNERS.push(gameMap[x][y])
        } else {
          gameMap[x][y] = new Tile(x, y, 'white')
        }
      } else {
        gameMap[x][y] = new Tile(x, y, 'white')
      }
      gameMap[x][y].clearCell()
    }
  }
}


function setup () {
  createCanvas()
  const generator = new Generators(gameMap);
  drawMap(gameMap);
  snek1 = new Snek(0, 39, 'green', 'wasd')
  snek2 = new Snek(39, 39, 'red', 'ijkl')
  document.addEventListener('keypress', function(e) {
    snek1.getDirection(e.key)
    snek2.getDirection(e.key)
  })
  initialLife(generator);
  // generator.glider(25, 25)
  // generator.glider2(10, 25)
  generator.pentomino(10, 30)
  generator.pentomino(30, 10)
  spawnInterval = setInterval(function() {
    SPAWNERS.forEach(function(spawner) {
      spawner.spawn(generator)
    })
  }, 4000)

  drawInterval = setInterval(function() {
    snek1.move()
    snek2.move()
    redrawMap(gameMap)
  }, 300)

}

function initialLife(generator) {
  generator.toad(10, 29)
  generator.toad(6, 20)
  generator.toad(2, 35)
  generator.blinker(10, 35)
  generator.blinker(15, 35)
  generator.blinker(20, 35)
  generator.blinker(25, 35)
  generator.blinker(30, 35)
  generator.blinker(2, 30)
  generator.blinker(10, 30)
  generator.blinker(15, 30)
  generator.blinker(20, 30)
  generator.toad(25, 30)
  generator.blinker(30, 30)
  generator.blinker(2, 20)
  generator.blinker(10, 20)
  generator.blinker(15, 20)
  generator.blinker(20, 20)
  generator.blinker(25, 20)
  generator.blinker(25, 25)
  generator.toad(30, 20)
  generator.blinker(2, 10)
  generator.toad(10, 10)
  generator.blinker(15, 10)
  generator.blinker(20, 10)
  generator.blinker(25, 10)
  generator.toad(30, 10)
  generator.toad(2, 5)
  generator.blinker(10, 5)
  generator.blinker(15, 5)
  generator.blinker(20, 5)
  generator.blinker(25, 5)
  generator.blinker(30, 5)
}

function redrawMap (map) {
  countNeighbours(map)
  context.clearRect(0, 0, canvas.width, canvas.height);
  gameMap.forEach(function(row, x) {
    row.forEach(function(col, y) {
      if (map[x][y].occupied === 2) {
        if (map[x][y].neighbourCount === 2) {
          gameOver('red')
        }
        map[x][y].fillCell()
      } else if (map[x][y].occupied === 3) {
          if (map[x][y].neighbourCount === 2) {
            gameOver('green')
          }
          map[x][y].fillCell()
      }
      else if (map[x][y].neighbourCount < 2) {
        map[x][y].clearCell()
      } else if (map[x][y].neighbourCount > 3) {
        map[x][y].clearCell()
      } else if (map[x][y].occupied === 0 && map[x][y].neighbourCount === 3) {
        map[x][y].occupyCell(1, 'blue' );
      } else if (map[x][y].occupied !== 0){
        map[x][y].fillCell();
      }
    })
  })
}

function getRandomColor() {
  var colors = ['#c2f0f0', '#ff33cc', '#ffb3b3', '#ffff00', '#aaff00', '#00cc00', '#0066ff', '#9966ff'];
  return colors[Math.floor(Math.random() * 8)];
}

function countNeighbours(map) {
  gameMap.forEach(function(row, x) {
    row.forEach(function(col, y) {
      if (map[x][y].occupied === 0) {
        map[x][y].neighbourCount = map[x][y].getCount(map)
      } else if (map[x][y].occupied !== 0) {
        map[x][y].neighbourCount = map[x][y].getCount(map) - 1
      }
    })
  })
}

function gameOver(color) {
  canvas.remove()
  if (color === 'green') {
    loseCount.player1--
  } else {
    loseCount.player2--
  }
  CANVASCONTAINER.innerHTML = '<h1>The ' + color + ' Snek is the worst Snek EVER!</h1>'
  CANVASCONTAINER.innerHTML += '<h1>Score of Shame:</h1>'
  CANVASCONTAINER.innerHTML += "<h2 style='color: green'>Green: " + loseCount.player1 + "</h2>"
  CANVASCONTAINER.innerHTML += "<h2 style='color: red'>Red: " + loseCount.player2 + "</h2>"
  CANVASCONTAINER.innerHTML += "<button onclick='setup()'>Play again</button>"
  clearInterval(spawnInterval)
  clearInterval(drawInterval)
}
setup();
