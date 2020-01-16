import React from "react";

import Button from "react-bootstrap/Button"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

import "./App.css";


/*
// All React component classes that have a constructor should start it with a super(props) call.
class Square extends React.Component {
    // THIS CONSTRUCTOR GOT REMOVED WHEN WE LIFTED STATE UP TO BOARD -> CONSTRUCTOR IN BOARD NOW
    constructor (props) {
        super(props); // call the constructor of super class and pass in props parameter
        // set state to be an object with 1 key, value
        this.state = {
            value: null,
        };
    }

    render () {
        return (
            // () => passes a function to the onClick prop
            // same as onClick={function() { alert('click'); }}
            <button className="square" onClick={() => {
                return this.props.onClick();
            }}>
                {this.props.value}
            </button>
        );
    }
}
*/

// make Square to be a function component
// a component that ONLY contains render() and don't have their own state
function Square (props) {
    return (
        <Button
            style={{ width: 50, height: 50, borderRadius: 0 }}
            variant={props.variant}
            onClick={props.onClick}>
            {props.value}
        </Button>
    )
}

// Board fully controls Square components
class Board extends React.Component {
    /*
    // LIFT THE STATE OF THE SQUARE UP INTO PARENT BOARD CLASS
    // board will keep track of the state of each square and pass it down
    // constructor method is a special method for creating and initializing an
    // object creaed with a class - each class can only have constructor
    constructor (props) {
        // super() must be called before using this
        super(props);
        // state is JS object that can be updated
        this.state = {
            // construct JS array with 9 nulls
            squares: Array(9).fill(null),
            xIsNext: true,
        }
    }

    // Board passes this.handleClick(i) to Square as onClick, where THIS is Board
    // Square calls the function passed to onClick when it is clicked
    handleClick (i) {
        // create copy of squares instead of modifying existing array
        const squares = this.state.squares.slice();
        // ignore any further clicks if there is already a winner
        if (calculateWinner(squares)) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // doing this.state.k = v does not re-render component
        // this.setState({k: v}) is correct
        this.setState({
            squares: squares,
            // flip the value of xIsNext every click
            xIsNext: !this.state.xIsNext,
        });
        // setState() also accepts function:
        // this.setState((state, props) => ({...})); OR
        // this.setState(function(state, props) { return ...; })
    }
    */

    // pass down square state
    // also pass down function from Board -> Square so state can be updated in Board
    renderSquare (i) {
        // pass down two props from Board -> Square:
        // value (previously it was just number, which was ignored but now it will be state)
        // onClick (a function that Square can call when clicked)
        return (
            <Square
                key={i}
                variant={this.props.variant}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        )
    }

    render () {
        // this is removed when we lifted state up from Board -> Game
        /*
        const winner = calculateWinner(this.state.squares);
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
        }
        */
        var rowA = [1, 2, 3];
        var body = rowA.map((rowN) => {
            return (
                <Row key={rowN}>
                    <ButtonGroup size="lg">
                        {rowA.map((colN) => {
                            return this.renderSquare(convertCoordToI({ row: rowN, col: colN }));
                        })}
                    </ButtonGroup>
                </Row>
            )
        })
        return (
            <Container>
                {body}
            </Container>
        );
    }
}

// LIFT UP STATE AGAIN FROM Board -> Game
class Game extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            // an array of objects that each have 1 key (squares) and value (an Array(9))
            history: [{
                squares: Array(9).fill(null),
            }],
            historyMoves: [{
                row: null,
                col: null,
            }],
            xIsNext: true,
            // indicate which step we are currently viewing
            stepNumber: 0,
            descending: true,
            squaresFormat: Array(9).fill('outline-dark')
        };
    }

    // i comes from renderSquare, passed in manually in Board.render()
    // onClick of renderSquare references this handleClick function, passes in i
    handleClick (i) {
        // slice up to the stepNumber just in case we went back in time
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const historyMoves = this.state.historyMoves.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        // ignore clicks if winner or square already clicked
        // highlight the winning boxes
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // the only legitimate way to update state after initial state setup
        // Reach merges this new object into the existing state object
        this.setState({
            // push mutates the array concat does not
            history: history.concat([{
                squares: squares,
            }]),
            // row, column
            historyMoves: historyMoves.concat([convertIToCoord(i)]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    jumpTo (step) {
        this.setState({
            // the step we want to view
            stepNumber: this.state.descending ? step : this.state.history.length - 1 - step,
            // 0, 2, etc. are all Xs
            xIsNext: (step % 2) === 0,
        })
    }

    flipHistory () {
        this.setState({
            descending: !this.state.descending,
        })
    }

    render () {
        const history = this.state.history.slice();
        const historyMoves = this.state.historyMoves.slice();
        // get most recent state of board (not history.length - 1)
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares)
        console.log(this.state.descending);
        if (!this.state.descending) {
            history.reverse();
            historyMoves.reverse();
        }
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
        }
        // arr.map(function callback(currentValue[, index[, array]])
        const moves = history.map((step, move) => {
            let desc
            if (historyMoves[move].row === null) {
                desc = 'Go to game start';
            } else {
                var displayMove = move
                if (!this.state.descending) {
                    displayMove = history.length - 1 - move
                }
                desc = 'Go to move# ' + displayMove + ': (' + historyMoves[move].row + ', ' + historyMoves[move].col + ')';
            }
            return (
                // key should be used when building dynamic lists
                // everytime the list is re-rendered React compares 
                // each list item to previous list's items by key - 
                // if it's a new key then a component is created
                // if previous key is missing in current previous is destroyed
                // if two keys match the component is moved
                <div key={move}>
                    <Button variant="light" onClick={() => this.jumpTo(move)} active={displayMove === this.state.stepNumber}>
                        {desc}
                    </Button>
                </div>
            )
        })
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        variant={"outline-dark"}
                        squares={current.squares}
                        // same as onClick={function(i) { contents of handleClick }}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>
                        {status}
                    </div>
                    <div>
                        <Button onClick={() => this.flipHistory()}>Reverse</Button>
                    </div>
                    <div>{moves}</div>
                </div>
            </div>
        );
    }
}

function calculateWinner (squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        // use && to make sure it's not null
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: line };
        }
    }
    return { winner: null, line: null };
}

function convertIToCoord (i) {
    return {
        row: parseInt(i / 3) + 1,
        col: (i % 3) + 1,
    };
}

function convertCoordToI ({ row, col }) {
    return (row - 1) * 3 + (col - 1);
}

export default Game;
