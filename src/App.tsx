import * as React from 'react';
import './App.css';

interface HasGridPosition {
  x: number;
  y: number;
}

interface CircleProps extends HasGridPosition {
  set: boolean;
  onClick: (x: number, y: number) => void;
}

let toScreen = (pos: HasGridPosition) => {
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
        onClick={() => props.onClick(props.x, props.y)}
      />
    );
};

interface CatState extends HasGridPosition {}

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
  cells: CellState[];
  cat: CatState;
}

class App extends React.Component < AppProps, AppState > {
  constructor(props: AppProps) {
    super(props);
    
    let catState = {x: 5, y: 5};

    this.state = {cells: [], cat: catState};

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
          <Cat x={this.state.cat.x} y={this.state.cat.y}/>
        </svg>
      </div>
    );
  }
}

export default App;
