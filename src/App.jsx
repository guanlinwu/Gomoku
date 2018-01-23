import React, { Component } from 'react';
import logo from './logo.svg';
import music from './combo.mp3';
import './App.css';
import Square from './components/Square';
// import Modal from './components/Modal';

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lineNum: 15,
            isWin: false,
            chessColor: 2,//1 代表白棋， 2 代表黑棋
            board: {}
        };

        this.playChess = this.playChess.bind(this);
        this.getPosDec = this.getPosDec.bind(this);
        this.checkWinner = this.checkWinner.bind(this);
        this.reStart = this.reStart.bind(this);
    }

    componentDidMount() {
        this.music = document.getElementById('music');
    }

    componentDidUpdate() {
        console.log(this.state)
        if (this.state.isWin) {
            setTimeout(()=> {
                alert('winner is ' + this.state.isWin);
            }, 500);
        }
    }

    getPosDec(x, y) {
        return `${x}-${y}`;
    }
    /**
     * 在棋盘下下黑白棋
     *
     * @param {any} x
     * @param {any} y
     * @memberof App
     */
    playChess(x, y) {
        let board = { ...this.state.board },
            posDec = this.getPosDec(x, y),
            chessColor = 3 - this.state.chessColor;
        board[posDec] = chessColor;

        this.music.play();
        this.setState({
            chessColor,
            board: { ...board }
        });

        let winner = this.checkWinner(x, y, board);
        if (winner) {
            this.setState({
                isWin: winner
            });
        }
    }

    /**
     * 判断输赢
     *
     * @param {any} x
     * @param {any} y
     * @memberof App
     */
    checkWinner(x, y, board) {
        let orientation = [],// -
            portrait = [],// |
            skewLeft = [],// \
            skewRight = [],// /
            getPosDec = this.getPosDec,
            curChessColor = board[getPosDec(x, y)],
            temp,
            reg = /([1]{5})/
        if (curChessColor === 2) {
            reg = /([2]{5})/;
        }

        //横向判断     xxxx(cur)xxxx
        for (let i=x-4; i< x+5; i++) {
            temp = board[getPosDec(i, y)];
            temp == undefined ? orientation.push(0) : orientation.push(temp);
        }
        console.log(orientation.toString())
        if (reg.test(orientation.toString().replace(/,/g, ''))) {
            return curChessColor;
        }

        //纵向判断
        for (let k = y - 4; k < y + 5; k++) {
            temp = board[getPosDec(x, k)];
            temp == undefined ? portrait.push(0) : portrait.push(temp);
        }
        console.log(portrait.toString())
        if (reg.test(portrait.toString().replace(/,/g, ''))) {
            return curChessColor;
        }

        // \向判断
        for (let _x = x-4, _y = y-4; _y < y+5; _y++, _x++) {
            temp = board[getPosDec(_x, _y)];
            temp == undefined ? skewLeft.push(0) : skewLeft.push(temp);
        }
        console.log(skewLeft.toString())
        if (reg.test(skewLeft.toString().replace(/,/g, ''))) {
            return curChessColor;
        }

        // /向判断
        for (let _x = x - 4, _y = y + 4; _x < x + 5; _y--, _x++) {
            temp = board[getPosDec(_x, _y)];
            temp == undefined ? skewRight.push(0) : skewRight.push(temp);
        }
        console.log(skewRight.toString())
        if (reg.test(skewRight.toString().replace(/,/g, ''))) {
            return curChessColor;
        }

        return false;
    }

    reStart() {
        this.setState(
            {
                lineNum: 15,
                isWin: false,
                chessColor: 2,//1 代表白棋， 2 代表黑棋
                board: {}
            }
        );

    }

    render() {
        let { lineNum, board, isWin } = this.state;
        let squares = [];
        for (let y = 0; y < lineNum; y++) {
            for (let x = 0; x < lineNum; x++) {
                squares.push(<Square chessColor={board[this.getPosDec(x, y)]} isWin={isWin} key={`square-${x}-${y}`} coord={{ x, y }} playChess={this.playChess} />);
            }
        }
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
                <div className="chess">
                    {squares}
                </div>
                <div className="btn-box">
                    <a className="btn" href="javascript:;" onClick={this.reStart}>重新开始</a>
                </div>
                <audio id="music" src={music} hidden></audio>
            </div>
        );
    }
}


export default App;
