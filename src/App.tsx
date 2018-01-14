import * as React from 'react';
import './App.css';

const gridWidth = 11;
const gridHeight = 11;
const screenRadius = 50;
const screenHeight = (gridHeight * screenRadius * 2) + screenRadius;
const screenWidth = (gridWidth * screenRadius * 2) + screenRadius;
const circleWidth = screenRadius * 0.9;
const circleHeight = screenRadius * 0.8;

interface GridPosition {
  x: number;
  y: number;
}

interface CatState extends GridPosition {}

interface CircleProps extends GridPosition {
  set: boolean;
  onClick: (pos: GridPosition) => void;
}

let toScreen = (pos: GridPosition) => {
  let offset = pos.y % 2 ? screenRadius : 0;
  return {
    cx: pos.x * screenRadius * 2 + screenRadius + offset,
    cy: pos.y * 74 + screenRadius
  }; 
};

let Circle = (props: CircleProps) => {
    let coords = toScreen(props);
    let className = props.set ? 'set' : 'unset';
    return (
      <ellipse
        cx={coords.cx}
        cy={coords.cy} 
        rx={circleWidth} 
        ry={circleHeight}
        className={className} 
        onClick={() => props.onClick(props)}
      />
    );
};

let Cat = (props: CatState) => {
  let coords = toScreen(props);
  return <circle cx={coords.cx} cy={coords.cy} r={30} />;
};

interface CellState {
  x: number;
  y: number;
  set: boolean;
}

interface AppProps {}

interface AppState {
  cells: CellState[][];
  cat: CatState;
}

class App extends React.Component < AppProps, AppState > {
  constructor(props: AppProps) {
    super(props);
    
    let catState = {
      x: Math.floor(gridWidth / 2), 
      y: Math.floor(gridHeight / 2)
    };

    this.state = {cells: [], cat: catState};

    for (let y = 0; y < gridHeight; y++) {
      let row = [];
      for (let x = 0; x < gridWidth; x++) {
        row.push({x: x, y: y, set: false});
      }
      this.state.cells.push(row);
    }
  }

  isValidPosition(pos: GridPosition) {
    return pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y >= gridHeight;
  }

  getNeighbours(pos: GridPosition) {
    let {x, y} = pos;
    let positions =
      (pos.y % 2)
        ? [
            {x: x - 1, y: y - 1},
            {x: x + 0, y: y - 1},
            {x: x + 1, y: y + 0}, 
            {x: x + 0, y: y + 1}, 
            {x: x - 1, y: y + 1}, 
            {x: x - 1, y: y + 0}
          ] 
        : [
            {x: x - 0, y: y - 1},
            {x: x + 1, y: y - 1},
            {x: x + 1, y: y + 0}, 
            {x: x + 1, y: y + 1}, 
            {x: x - 0, y: y + 1}, 
            {x: x - 1, y: y + 0}
          ];
    
    return positions.filter(this.isValidPosition);
  }

  getPossibleMoves(catPosition: GridPosition) {
    let neighbours = this.getNeighbours(catPosition);

    return neighbours.filter(n => !this.state.cells[n.y][n.x].set);
  }

  getNextMove(catPosition: GridPosition) {
    let possibleMoves = this.getPossibleMoves(catPosition);

    let index = Math.floor(Math.random() * possibleMoves.length);

    return possibleMoves[index];
  }

  getCell(pos: GridPosition) {
    if (!this.isValidPosition(pos)) {
      throw new Error(`illegal operation ${pos.x},${pos.y} outside of play area`);
    }
    
    return this.state.cells[pos.y][pos.x];
  }

  handleClick(pos: GridPosition) { 
    const cells = this.state.cells.map(row => {
      return row.map(cell => {
        if (cell.x === pos.x && cell.y === pos.y) {
          return {...cell, set: true};
        }
        return cell;
      });
    });

    const cat = {...pos};
    this.setState({cells: cells, cat: cat});
  }

  render() {
    return (
      <div className="board">
        <svg viewBox={`0 0 ${screenWidth} ${screenHeight}`} xmlns="http://www.w3.org/2000/svg">
          {
            this.state.cells
              .map(
                  (row) =>
                    row.map(cell =>  
                      <Circle 
                        key={`${cell.x}-${cell.y}`} 
                        x={cell.x} 
                        y={cell.y}
                        set={cell.set}
                        onClick={pos => this.handleClick(pos)} 
                      /> )
                    )
          }
          <Cat 
            x={this.state.cat.x} 
            y={this.state.cat.y}
          />
        </svg>
      </div>
    );
  }
}

export default App;
