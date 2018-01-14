import * as React from 'react';
import './App.css';

interface CircleProps {
  x: number;
  y: number;
  set: boolean;
  onClick: (x: number, y: number) => void;
}

let toCoords = (x: number, y: number) => {
  let offset = y % 2 ? 50 : 0;
  return {
    cx: x * 100 + 50 + offset,
    cy: y * 74 + 50
  }; 
};

let Circle = (props: CircleProps) => {
    let coords = toCoords(props.x, props.y);
    let className = props.set ? 'set' : 'unset';
    return (
      <ellipse
        cx={coords.cx}
        cy={coords.cy} 
        rx={45} 
        ry={40}
        className={className} 
        onClick={() => props.onClick(props.x, props.y)}
      />
    );
};

// let Cat = (props: CatProps) => <

interface CellState {
  x: number;
  y: number;
  set: boolean;
}

interface AppProps {}

interface AppState {
  cells: CellState[];
}

class App extends React.Component < AppProps, AppState > {
  constructor(props: AppProps) {
    super(props);
    
    this.state = {cells: []};

    for (let y = 0; y < 11; y++) {
      for (let x = 0; x < 11; x++) {
        this.state.cells.push({x: x, y: y, set: false});
      }
    }
  }
 
  render() {
    var setCell = (x: number, y: number) => { 
      const cells = this.state.cells.map ((cell) => {
        if (cell.x === x && cell.y === y) {
          return {...cell, set: true};
        }
        return cell;
      });
      this.setState({cells: cells});
    };

    return (
      <div className="board">
        <svg viewBox="0 0 1150 1150" xmlns="http://www.w3.org/2000/svg">
          {
            this.state.cells
              .map(
                  (cell) => 
                    <Circle 
                      key={'' + cell.x + '-' + cell.y} 
                      x={cell.x} 
                      y={cell.y}
                      set={cell.set}
                      onClick={setCell} 
                    /> )
          }
        </svg>
      </div>
    );
  }
}

export default App;
