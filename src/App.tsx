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

let posEquals = (a: GridPosition, b: GridPosition) => a.x === b.x && a.y === b.y;

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
      >
        <text>{`${props.x},${props.y}`}</text>
      </ellipse>
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

class AStarCell {
  f: number;
  shortestDistance: number;
  h: number;
  visited: boolean;
  closed: boolean;
  parent: AStarCell;
  cellState: CellState;

  constructor(cell: CellState) {
    this.cellState = cell;
  }
}

class App extends React.Component<AppProps, AppState> {
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

    for (let n = 0; n < 20; n++) {
      let x = Math.floor(Math.random() * gridWidth);
      let y = Math.floor(Math.random() * gridHeight);
      if (x !== catState.x && y !== catState.y) {
          if (!this.state.cells[y][x].set) {
            this.state.cells[y][x].set = true;
          }
      }
    }
  }

  isValidPosition(pos: GridPosition) {
    return pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y < gridHeight;
  }

  getNeighbours(pos: GridPosition) {
    let {x, y} = pos;
    let positions =
      (pos.y % 2 === 0)
        ? [
            {x: x - 1, y: y - 1},
            {x: x + 0, y: y - 1},
            {x: x - 1, y: y + 0},
            {x: x + 1, y: y + 0}, 
            {x: x + 0, y: y + 1}, 
            {x: x - 1, y: y + 1},
          ] 
        : [
            {x: x - 0, y: y - 1},
            {x: x + 1, y: y - 1},
            {x: x - 1, y: y + 0},
            {x: x + 1, y: y + 0}, 
            {x: x + 1, y: y + 1}, 
            {x: x - 0, y: y + 1},
          ];
    
    return positions.filter(this.isValidPosition);
  }

  getCell(cells: CellState[][], pos: GridPosition) {
    if (!this.isValidPosition(pos)) {
      throw new Error(`illegal operation ${pos.x},${pos.y} outside of play area`);
    }
    
    return cells[pos.y][pos.x];
  }

  getPossibleMoves(cells: CellState[][], catPosition: GridPosition) {
    let neighbours = this.getNeighbours(catPosition);

    return neighbours.filter(n => !this.getCell(cells, n).set);
  }

  getRandomMove(cells: CellState[][], catPosition: GridPosition) {
    let possibleMoves = this.getPossibleMoves(cells, catPosition);

    return (possibleMoves.length > 0) 
      ? possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
      : catPosition;
  }

  isBorderCell(cell: GridPosition) {
    return cell.x === 0 
    || cell.y === 0 
    || cell.x === gridWidth - 1 
    || cell.y === gridHeight - 1;
  }

  // modified A* algorithm to find quickest route to an edge 
  // https://github.com/bgrins/javascript-astar/blob/0.0.1/original-implementation/astar-list.js
  searchShortestPathToEdge (cells: CellState[][], start: GridPosition) {

    let grid = cells.map(row => row.map(c => new AStarCell(c)));

    var openList: AStarCell[] = [grid[start.y][start.x]];

    while (openList.length > 0) {

        var lowInd = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowInd].f) { lowInd = i; }
        }
        var currentNode = openList[lowInd];

        if (this.isBorderCell(currentNode.cellState)) {
            var curr = currentNode;
            var ret = [];
            while (curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            return ret.reverse();
        }

        openList.splice(lowInd, 1);
        currentNode.closed = true;

        var neighbors = this.getNeighbours(currentNode.cellState);
        for (let n of neighbors) {
            let {x, y} = n;
            var neighbour = grid[y][x];

            if (neighbour.closed || neighbour.cellState.set) {
                continue;
            }

            var distance = currentNode.shortestDistance + 1;
            var distanceIsShortest = false;

            if (!neighbour.visited) {
                distanceIsShortest = true;
                [neighbour.h] = [x, y, gridWidth - x, gridWidth - y].sort();
                neighbour.visited = true;
                openList.push(neighbour);
            } else if (distance < neighbour.shortestDistance) {
                distanceIsShortest = true;
            }

            if (distanceIsShortest) {
                neighbour.parent = currentNode;
                neighbour.shortestDistance = distance;
                neighbour.f = neighbour.shortestDistance + neighbour.h;
            }
        }
    }

    return [];
}

  updateCell (cell: CellState) {
    return this.state.cells.map(
      row => row.map(c => posEquals(c, cell) ? cell : c));
  }

  handleClick(pos: GridPosition) { 
    let cell = this.getCell(this.state.cells, pos);

    if (cell.set || posEquals(cell, this.state.cat)) {
      return;
    }

    let newCells = this.updateCell({...cell, set: true});

    let quickestPath = this.searchShortestPathToEdge(newCells, this.state.cat);

    let nextMovePos = 
      (quickestPath.length > 0) 
      ? quickestPath[0].cellState 
      : this.getRandomMove(newCells, this.state.cat);
    
    if (posEquals(this.state.cat, nextMovePos)) {
      alert('Well done!');
    }

    let nextState = {
      cat: {...this.state.cat, ...nextMovePos},
      cells: newCells
    };
    this.setState(nextState);
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
