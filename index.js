
// Interface between board and canvas
class Board {
  
  constructor(cellSize, canvasWidth, canvasHeight) {
    this.cellSize = cellSize;
    this.width = canvasWidth / cellSize;
    this.height = canvasHeight / cellSize;
    this.activeCells = new Set();
  }

  activateCellWithPixel(x, y) {
    x = Math.floor(x / this.cellSize);
    y = Math.floor(y / this.cellSize);
    this.activeCells.add(toString(x,y));
    return [x*this.cellSize, y*this.cellSize, this.cellSize];
  }
  
  deactivateCellWithPixel(x, y) {
    x = Math.floor(x / this.cellSize);
    y = Math.floor(y / this.cellSize);
    if(this.activeCells.has(toString(x,y)))
    this.activeCells.delete(toString(x,y));
    return [x*this.cellSize, y*this.cellSize, this.cellSize];
  }
  
  getNextGen() {
    this.activeCells = getNextGeneration(this.activeCells, this.width, this.height);
    const nextGen = [...this.activeCells].map(cell => {
      let [x, y] = fromString(cell);
      x *= this.cellSize;
      y *= this.cellSize;
      return {x, y};
    });
    return [nextGen, this.cellSize];
  }
  
}

// Utility Functions
function toString(x, y) {
  return `${x},${y}`;
}

function fromString(cstring) {
  let [x, y] = cstring.split(',');
  return [parseInt(x), parseInt(y)];
}

// Main function for conway's game of life
function getNextGeneration(activeCells, width, height) {
  nextGen = new Set();
  for(let x=0; x<width; ++x) {
    for(let y=0; y<height; ++y) {
      isAlive = activeCells.has(toString(x, y));
      numNeighbours = getNumNeighbours(x, y);
      // if(isAlive) console.log({x, y, isAlive, numNeighbours});
      if(isAlive && [2, 3].includes(numNeighbours)) nextGen.add(toString(x, y));
      if(!isAlive && numNeighbours === 3) nextGen.add(toString(x, y));
    }
  }

  return nextGen;
  
  function getNumNeighbours(x, y) {
    let count = 0;
    for(let i = -1; i <= 1; ++i) {
      for(let j = -1; j <= 1; ++j) {
        if(i === 0 & j === 0) continue;
        if(x+i >= width || x+i < 0 || y+j >= height || y+j < 0) continue;
        if(activeCells.has(toString(x+i, y+j))) count++;
      }
    }
    return count;   
  }
}

// Declare and define Global Variables
const canvas = document.getElementById('board');
const eraser = document.getElementById('eraser');
const resetButton = document.getElementById('reset');
const startBtn = document.getElementById('start');

const ctx = canvas.getContext('2d');
console.log(ctx);

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
const width = ctx.canvas.width;
const height = ctx.canvas.height;

const INACTIVE = '#101010';
const ACTIVE = '#FFF';
const GEN_INTERVAL = 250;
const CELLSIZE = 5;


let isMouseDown = false;
let isEraser = false;
let board;
let isPaused;
let nextGenTimer;

reset(); // Reset the board and init values

function handleSelection(e) {
  if(!isMouseDown) return;
  let x = e.clientX;
  let y = e.clientY;
  let cellSize;
  [x, y, cellSize] = isEraser 
                      ? board.deactivateCellWithPixel(x,y) 
                      : board.activateCellWithPixel(x, y);                    
  ctx.fillStyle = isEraser ? INACTIVE : ACTIVE;
  ctx.fillRect(x, y, cellSize, cellSize);
}

function goToNextGeneration() {
  let [activeCells, cellSize] = board.getNextGen();
  ctx.fillStyle = INACTIVE;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = ACTIVE;
  activeCells.forEach(cell => {
    ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
  });
  if(activeCells.length === 0) {
    setTimeout(() => alert('All cells died'), 100);    
    reset();
  }
}

function reset() {
  ctx.fillStyle = INACTIVE;
  ctx.fillRect(0, 0, width, height);
  clearInterval(nextGenTimer);
  startBtn.innerText = 'Start simulation';
  isPaused = true;
  board = new Board(CELLSIZE, width, height);
}

function simulate() {
  console.log('simulate');
  nextGenTimer = window.setInterval(goToNextGeneration, GEN_INTERVAL);
}

// Setup event listeners
canvas.addEventListener('mousedown', e => {
  isMouseDown = true;
  handleSelection(e);
});
canvas.addEventListener('mousemove', handleSelection);
canvas.addEventListener('mouseup', e => isMouseDown = false);

eraser.addEventListener('click', e => {
  isEraser = !isEraser
  eraser.innerText = isEraser ? 'Activate cells' : 'Deactivate cells';
});

resetButton.addEventListener('click', e => reset());


startBtn.addEventListener('click', e => {
  isPaused = !isPaused;
  isPaused ? clearInterval(nextGenTimer) : simulate();
  startBtn.innerText = isPaused ? 'Start simulation' : 'Pause simulation';
});





