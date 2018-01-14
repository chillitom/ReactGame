import * as React from 'react';
import './App.css';

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
  let offset = pos.y % 2 ? 50 : 0;
  return {
    cx: pos.x * 100 + 50 + offset,
    cy: pos.y * 74 + 50
  }; 
};

let Circle = (props: CircleProps) => {
    let coords = toScreen(props);
    let className = props.set ? 'set' : 'unset';
    return (
      <ellipse
        cx={coords.cx}
        cy={coords.cy} 
        rx={45} 
        ry={40}
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
    
    let catState = {x: 5, y: 5};

    this.state = {cells: [], cat: catState};

    for (let y = 0; y < 11; y++) {
      let row = [];
      for (let x = 0; x < 11; x++) {
        row.push({x: x, y: y, set: false});
      }
      this.state.cells.push(row);
    }
  }
 
  setCell(pos: GridPosition) { 
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
        <svg viewBox="0 0 1150 1150" xmlns="http://www.w3.org/2000/svg">
          {
            this.state.cells
              .map(
                  (row) =>
                    row.map(cell =>  
                      <Circle 
                        key={'' + cell.x + '-' + cell.y} 
                        x={cell.x} 
                        y={cell.y}
                        set={cell.set}
                        onClick={pos => this.setCell(pos)} 
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
