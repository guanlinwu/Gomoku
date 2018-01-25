import React, { Component } from 'react';
import logo from './logo.svg';
import music from './combo.mp3';
import './App.css';
import Square, { MoveSquare } from './components/Square';
import Modal from './components/Modal';
import * as io from 'socket.io-client';

// let socket = io('http://192.168.199.189:3002/');
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
            board: {},
            translateX: 0,
            translateY: 0
        };
        this.startX = this.startY =
        this.endX =  this.endY =
        this.squaresW = this.squaresH =
        this.lastTranslateX = this.lastTranslateY = 0;

        this.play = this.play.bind(this);
        this.playChess = this.playChess.bind(this);
        this.getPosDec = this.getPosDec.bind(this);
        this.checkWinner = this.checkWinner.bind(this);
        this.setChess = this.setChess.bind(this);
        this.reStart = this.reStart.bind(this);
        this.touchStart = this.touchStart.bind(this);
        this.touchMove = this.touchMove.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    componentWillMount() {
        socket.emit('login', { 'userName': new Date().getTime().toString() });
        socket.on('role',  (data) => {
            console.log('role ', data)
            if (data.isBalck !== null) {
                this.setState({
                    isBalck: data.isBalck,
                    isBalckTurn: data.isBalckTurn,
                    board: data.board
                });
            }
        }).on('restart', () => {
            this.setState(
                {
                    lineNum: 15,
                    isWin: false,
                    chessColor: 2,//1 代表白棋， 2 代表黑棋
                    isBalckTurn: true,//是否轮到黑棋玩了
                    board: {},
                    translateX: 0,
                    translateY: 0
                }
            );
        })
    }

    componentDidMount() {
        this.moveSquareNode = document.querySelector('.square');
        this.music = document.getElementById('music');
        this.squaresW = this.moveSquareNode.offsetWidth;//获取每次移动的单位距离
        this.squaresH = this.moveSquareNode.offsetHeight;//获取每次移动的单位距离
        this.maxW = this.moveSquareNode.offsetWidth * (this.state.lineNum - 1);
        this.maxH = this.moveSquareNode.offsetWidth * (this.state.lineNum - 1);
        socket.on('play chess', (data) => {
            console.log('play chess ', data)
            this.setChess(data.x, data.y, data.chessColor);
        })
    }

    getPosDec(x, y) {
        return `${x}-${y}`;
    }

    play() {
        let x = this.lastTranslateX / this.squaresW,
            y = this.lastTranslateY / this.squaresH,
            chessColor = this.state.board[this.getPosDec(x, y)];
        if (!this.state.isWin && !chessColor) {
            this.playChess(x, y);

            this.lastTranslateX =0;
            this.lastTranslateY =0;

        }
    }

    /**
     * 在棋盘下下黑白棋
     *
     * @param {any} x
     * @param {any} y
     * @memberof App
     */
    playChess(x, y) {
        if (this.state.isBalck === null) {
            console.log('你是旁观者')
            return;
        }
        if (this.state.isBalck == this.state.isBalckTurn) {
            this.music.play();
            let board = { ...this.state.board },
                posDec = this.getPosDec(x, y);

            board[posDec] = this.state.chessColor;
            socket.emit('play chess', {
                x,
                y,
                isBalckTurn: !this.state.isBalckTurn,
                chessColor: this.state.chessColor,
                board: { ...board }
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
            board: { ...board },
            translateX: 0,
            translateY: 0
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
        socket.emit('restart', { 'restartTime': new Date().getTime().toString() });
        if (this.state.isWin) {
        }
    }

    touchStart(e) {
        e.preventDefault();
        if (this.state.isBalck == null || this.state.isBalck != this.state.isBalckTurn) return;
        let targetTouches = e.targetTouches[0]
        this.startX = targetTouches.clientX || targetTouches.pageX;
        this.startY = targetTouches.clientY || targetTouches.pageY;
        this.lastTranslateX = this.state.translateX;
        this.lastTranslateY = this.state.translateY;
    }

    touchMove(e) {
        e.preventDefault();
        if (this.state.isBalck == null || this.state.isBalck != this.state.isBalckTurn) return;
        console.log(e)
        let targetTouches = e.targetTouches[0],
            _translateX = this.lastTranslateX,
            _translateY = this.lastTranslateY,
            dx = 0,
            dy = 0
        this.endX = targetTouches.clientX || targetTouches.pageX;
        this.endY = targetTouches.clientY || targetTouches.pageY;
        dx = this.endX - this.startX;
        dy = this.endY - this.startY;
        let rawDx = _translateX + dx;
        rawDx = Math.ceil(rawDx * 1 / this.squaresW) * this.squaresW;
        (rawDx > this.maxW) && (rawDx = this.maxW);
        rawDx < 0 && (rawDx = 0);
        this.setState({
            translateX: rawDx
        });
        let rawDy = _translateY + dy;
        rawDy = Math.ceil(rawDy * 1 / this.squaresH) * this.squaresH;
        (rawDy > this.maxH) && (rawDy = this.maxH);
        rawDy < 0 && (rawDy = 0);
        this.setState({
            translateY: rawDy
        });
        console.log(rawDx, rawDy)
    }

    touchEnd(e) {
        e.preventDefault();
        if (this.state.isBalck == null || this.state.isBalck != this.state.isBalckTurn) return;
        this.lastTranslateX = this.state.translateX;
        this.lastTranslateY = this.state.translateY;
        console.log(this.lastTranslateX, this.lastTranslateY)
    }

    render() {
        let { lineNum, board, isWin, isBalck, isBalckTurn, translateX, translateY } = this.state;
        let squares = [],
        member = '';
        switch (isBalck) {
            case true:
                member = '黑棋';
                break;
            case false:
                member = '白棋';
                break;
            default:
                member = '旁观者';
                break;
        }
        for (let y = 0; y < lineNum; y++) {
            for (let x = 0; x < lineNum; x++) {
                squares.push(<Square chessColor={board[this.getPosDec(x, y)]} key={`square-${x}-${y}`} />);
            }
        }
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p className="text">
                        身份: {member}
                        <br/>
                        轮到: {isBalckTurn ? '黑棋' : '白棋'}
                    </p>
                </header>
                <div className="chess" onTouchStart={this.touchStart} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd}>
                    {squares}
                    {isBalck !== null && isBalck == isBalckTurn && <MoveSquare  chessColor={isBalck? 2 : 1} translateX={translateX} translateY={translateY}/>}
                </div>
                <div className="btn-box">
                    <a className="btn" style={this.state.isWin ? {} : { background: '#ccc', color: '#eee', boxShadow: 'none'}} href="javascript:;" onClick={this.reStart}>重新开始</a>
                    <a className="btn" href="javascript:;" onClick={this.play}>落棋</a>
                    {/* <a className="btn" href="javascript:;" >悔棋</a> */}
                </div>
                <audio id="music" src={music} hidden></audio>
                <Modal isWin={this.state.isWin} isBalck={this.state.isBalck}/>
            </div>
        );
    }
}


export default App;
