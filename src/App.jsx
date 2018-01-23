import React, { Component } from 'react';
import logo from './logo.svg';
import music from './combo.mp3';
import './App.css';
import Square from './components/Square';
import Modal from './components/Modal';
import * as io from 'socket.io-client';

let socket = io('http://localhost:3002/');

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lineNum: 15,
            isWin: false,
            chessColor: 2,//1 代表白棋， 2 代表黑棋
            isBalck: null, //是否是黑棋
            isBalckTurn: true,//是否轮到黑棋玩了
            board: {}
        };

        this.playChess = this.playChess.bind(this);
        this.getPosDec = this.getPosDec.bind(this);
        this.checkWinner = this.checkWinner.bind(this);
        this.setChess = this.setChess.bind(this);
        this.reStart = this.reStart.bind(this);
    }

    componentWillMount() {
        socket.emit('login', { 'userName': new Date().getTime().toString() });
        socket.on('role',  (data) => {
            console.log('role ', data)
            if (data.isBalck !== null) {
                this.setState({
                    isBalck: data.isBalck
                });
            }
        }).on('restart', () => {
            this.setState(
                {
                    lineNum: 15,
                    isWin: false,
                    chessColor: 2,//1 代表白棋， 2 代表黑棋
                    isBalckTurn: true,//是否轮到黑棋玩了
                    board: {}
                }
            );
        })
    }

    componentDidMount() {
        this.music = document.getElementById('music');
        socket.on('play chess', (data) => {
            console.log('play chess ', data)
            this.setChess(data.x, data.y, data.chessColor);
        })
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
        if (this.state.isBalck == this.state.isBalckTurn) {
            this.music.play();
            socket.emit('play chess', {
                x,
                y,
                isBalckTurn: !this.state.isBalckTurn,
                chessColor: this.state.chessColor
            })
        }
    }

    setChess(x, y, chessColor) {
        let board = { ...this.state.board },
            posDec = this.getPosDec(x, y);

        board[posDec] = chessColor;

        this.setState({
            chessColor: 3 - this.state.chessColor,
            isBalckTurn: !this.state.isBalckTurn,
            board: { ...board }
        });

        let winner = this.checkWinner(x, y, board);
        if (winner) {
            setTimeout(()=> {
                this.setState({
                    isWin: winner
                });
            }, 500);
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
        if (this.state.isWin) {
            socket.emit('restart', { 'restartTime': new Date().getTime().toString() });
        }
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
                    <p className="text">
                        You: {this.state.isBalck ?  '黑棋' : '白棋'}
                        <br/>
                        轮到：{this.state.isBalckTurn ? '黑棋' : '白棋'}
                    </p>
                </header>
                <div className="chess">
                    {squares}
                </div>
                <div className="btn-box">
                    <a className="btn" style={this.state.isWin ? {} : { background: '#ccc', color: '#eee', boxShadow: 'none'}} href="javascript:;" onClick={this.reStart}>重新开始</a>
                </div>
                <audio id="music" src={music} hidden></audio>
                <Modal isWin={this.state.isWin} isBalck={this.state.isBalck}/>
            </div>
        );
    }
}


export default App;
