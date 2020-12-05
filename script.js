class GameOfLife {
  
  cells = [];
  columns = 0;
  rows = 0;
  tps = 1;
  
  constructor(canvas, rows, columns) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.setRowsCount(rows);
    this.setColumnsCount(columns);
    
    this.canvas.addEventListener("click", this.onClick.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
  
  onMouseMove(e) {
    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;
  }
  
  onClick(e) {
    const x = Math.floor(this.mouseX / this.canvas.width * this.columns);
    const y = Math.floor(this.mouseY / this.canvas.height * this.rows);
    
    if(x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
      this.cells[y][x] = !this.cells[y][x];
      this.drawCell(x, y);
    }
  }
  
  setRowsCount(rows) {
    if(rows < this.cells.length) {
      this.cells.splice(rows - 1, this.cells.length - rows);
    } else if(rows > this.cells.length) {
      const emptyRow = Array.from(new Array(this.columns)).map(c => false);
      const newRows = Array.from(new Array(rows - this.cells.length)).map(r => [...emptyRow]);
      this.cells.push(...newRows);
    }
    this.rows = rows;
    
    this.drawGrid();
    this.drawAllCells();
  }
  
  setColumnsCount(columns) {
    this.cells.forEach(row => {
      if(columns < row.length) {
        row.splice(columns - 1, row.length - columns);
      } else if(columns > row.length) {
        const newColumns = Array.from(new Array(columns - row.length)).map(c => false);
        row.push(...newColumns);
      }
    });
    this.columns = columns;
    
    this.drawGrid();
    this.drawAllCells();
  }
  
  drawGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cellWidth = this.canvas.width / this.columns;
    const cellHeight = this.canvas.height / this.rows;
    
    for(let x = 0; x < this.columns; x++) {
      this.drawGridLine(x * cellWidth, 0, x * cellWidth, this.canvas.height);
    };
    
    for(let y = 0; y < this.rows; y++) {
      this.drawGridLine(0, y * cellHeight, this.canvas.width, y * cellHeight);
    };
  }
  
  drawCell(x, y) {
    const state = this.cells[y][x];
    this.ctx.strokeStyle = "";
    this.ctx.fillStyle = state ? "yellow" : "white";
    const cellWidth = this.canvas.width / this.columns;
    const cellHeight = this.canvas.height / this.rows;
    
    this.ctx.fillRect(cellWidth * x + 1, cellHeight * y + 1, cellWidth - 2, cellHeight - 2);
  }
  
  drawAllCells() {
    for(let y = 0; y < this.rows; y++){
      for(let x = 0; x < this.columns; x++) {
        this.drawCell(x, y);
      }
    }
  }
  
  drawGridLine(x0, y0, x1, y1) {
    this.ctx.strokeStyle = "#222";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  };
  
  start() {
    if(!this.isRunning) {
      this.isRunning = true;
      this.generations = 0;
      if(this.generationsChangedCallback) {
        this.generationsChangedCallback(this.generations);
      }
      this.frameInterval = setInterval(this.frame.bind(this), 1000/this.tps);
    }
  }
  stop() {
    if(this.isRunning) {
      this.isRunning = false;
      clearInterval(this.frameInterval);
    }
  }
  
  getCellState(x, y) {
    if(x < 0 || y < 0 || x >= this.columns || y >= this.rows) {
      return false;
    } else {
      return this.cells[y][x];
    }
  }
  
  getNeighborsCount(x, y) {
    const neighbors = [
      this.getCellState(x - 1, y - 1),
      this.getCellState(x, y - 1),
      this.getCellState(x + 1, y - 1),
      this.getCellState(x - 1, y),
      this.getCellState(x + 1, y),
      this.getCellState(x - 1, y + 1),
      this.getCellState(x, y + 1),
      this.getCellState(x + 1, y + 1),
    ];
    
    return neighbors.filter(e => e === true).length;
  }
  
  frame() {
    const next = JSON.parse(JSON.stringify(this.cells)); // create deep copy
    const dirty = [];
    
    for(let y = 0; y < this.rows; y++) {
      for(let x = 0; x < this.columns; x++) {
        const neighborsCount = this.getNeighborsCount(x, y);
        
        if(this.cells[y][x]) {
          // alive
          if(neighborsCount < 2) {
            next[y][x] = false;
            dirty.push([x, y]);
          } else if(neighborsCount === 2 || neighborsCount === 3) {
            
          } else if(neighborsCount > 3) {
            next[y][x] = false; 
            dirty.push([x, y]);
          }
        } else {
          // dead
          if(neighborsCount === 3) {
            next[y][x] = true;
            dirty.push([x, y]);
          }
        }
      }
    }
    
    this.cells = next;
    
    this.generations++;
    if(this.generationsChangedCallback) {
      this.generationsChangedCallback(this.generations);
    }
    
    for(const dirtyCoords of dirty) {
      this.drawCell(dirtyCoords[0], dirtyCoords[1]);
    }
  }
  
  setTPS(tps) {
    this.tps = tps; 
    if(this.frameInterval) {
      this.stop();
      this.start();
    }
  }
  
  clear() {
    this.generations = 0;
    if(this.generationsChangedCallback) {
      this.generationsChangedCallback(this.generations);
    }
    
    for(let y = 0; y < this.rows; y++) {
      for(let x = 0; x < this.columns; x++) {
        const state = this.cells[y][x];
        this.cells[y][x] = false;
        if(state) {
          this.drawCell(x, y);  
        }
      }
    }
  }
  
  fillRandom() {
    for(let y = 0; y < this.rows; y++) {
      for(let x = 0; x < this.columns; x++) {
        this.cells[y][x] = Math.random() > 0.5 ? true : false;
      }
    }
  }
  
}


const numRowsEl = document.getElementById("num-rows")
const numColumnsEl = document.getElementById("num-columns");
const startPauseBtn = document.getElementById("start-pause");
const canvasEl = document.getElementById("canvas");
const toolbarEl = document.getElementById("toolbar");
const stepBtn = document.getElementById("step");
const tpsEl = document.getElementById("tps");
const clearBtn = document.getElementById("clear");
const generationsEl = document.getElementById("generations");

const resizeCanvas = () => {
  const toolbarHeight = toolbarEl.getBoundingClientRect().height;
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight - toolbarHeight;
};
resizeCanvas();

const game = new GameOfLife(canvasEl, numRowsEl.value, numColumnsEl.value);
game.setTPS(tpsEl.value);
game.fillRandom();
game.start();
startPauseBtn.value = "Stop";

game.generationsChangedCallback = generations => {
  generationsEl.innerText = generations;
}

clearBtn.addEventListener("click", () => {
  game.clear();
});
tpsEl.addEventListener("change", () => {
  game.setTPS(tpsEl.value);
});
startPauseBtn.addEventListener("click", () => {
  if(game.isRunning) {
    startPauseBtn.value = "Start";
    game.stop();
  } else {
    startPauseBtn.value = "Stop";
    game.start();
  }
});
stepBtn.addEventListener("click", () => game.frame());
numRowsEl.addEventListener("change", () => game.setRowsCount(numRowsEl.value));
numColumnsEl.addEventListener("change", () => game.setColumnsCount(numColumnsEl.value));
window.addEventListener("resize", () => {
  resizeCanvas()
  game.drawGrid();
  game.drawAllCells();
});