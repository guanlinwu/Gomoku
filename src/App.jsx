import React, { Component } from 'react';
import logo from './logo.svg';
import music from './combo.mp3';
import failMusic from './fail.mp3';
import successMusic from './success.mp3';
import './App.css';
import { Square, MoveSquare } from './components/Square';
import Modal from './components/Modal';
import Timer from './components/Timer';
import * as io from 'socket.io-client';

// let socket = io('http://192.168.199.189:3002/');
// let socket = io('http://localhost:3002/');
let socket = process.env.NODE_ENV == 'production' ? io() : io('http://localhost:3002/');

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lineNum    : 15,//行数
            isWin      : false,//是否产生赢家，或者是否结束游戏
            isBalck    : null, //是否是黑棋
            isBalckTurn: true,//是否轮到黑棋玩了
            board      : {},//存储棋盘数据
            translateX : 0,//移动棋子x位移值
            translateY : 0,//移动棋子y位移值
            lastPos    : null,//保存上一颗棋子的位置
            member     : '旁观者'//身份
        };
        this.timmerCom = null;

        this.startX         = this.startY =
        this.endX           = this.endY   =
        this.squaresWH      =
        this.lastTranslateX = this.lastTranslateY = 0;

        this.handlePlay       = this.handlePlay.bind(this);
        this.getPosDec        = this.getPosDec.bind(this);
        this.stratTimer       = this.stratTimer.bind(this);
        this.getCurChessColor = this.getCurChessColor.bind(this);
        this.checkWinner      = this.checkWinner.bind(this);
        this.setChess         = this.setChess.bind(this);
        this.reStart          = this.reStart.bind(this);
        this.touchStart       = this.touchStart.bind(this);
        this.touchMove        = this.touchMove.bind(this);
        this.touchEnd         = this.touchEnd.bind(this);

    }

    componentWillMount() {
        socket.emit('login', { 'userName': new Date().getTime().toString() });
        socket.on('role',  (data) => {
            console.log('role ', data)
            if (data.isBalck !== null) {
                /**
                 * 如果是黑棋或者白棋玩家
                 */
                let member = data.isBalck ? '黑棋': '白棋';
                this.setState({
                    isBalck    : data.isBalck,
                    isBalckTurn: data.isBalckTurn,
                    board      : data.board || {},
                    member     : member
                });

                if (data.isBalck !== null) {
                    this.stratTimer(data.timestamp);
                }
            }
        }).on('restart', (data) => {
            this.setState(
                {
                    lineNum    : 15,//行数
                    isWin      : false,//是否产生赢家，或者是否结束游戏
                    isBalckTurn: true,//是否轮到黑棋玩了
                    board      : {},//存储棋盘数据
                    lastPos    : null,//保存上一颗棋子的位置
                    translateX : 0,//移动棋子x位移值
                    translateY : 0//移动棋子y位移值
                }
            );
            this.stratTimer(data.timestamp);
        });
    }

    componentDidMount() {
        let moveSquareNode = document.querySelector('.square');
        this.music         = document.getElementById('music');
        this.squaresWH     = moveSquareNode.offsetWidth;//获取每次移动的单位距离
        this.maxWH         = moveSquareNode.offsetWidth * (this.state.lineNum - 1);

        socket.on('play chess', (data) => {
            console.log('play chess ', data)
            data.x && data.y && this.setChess(data.x, data.y);
            this.state.isBalck !== null && this.stratTimer(data.timestamp);
        });

        socket.on('rushtime', (data) => {
            console.log('timeout ', data)
            this.setState({
                isBalckTurn: data.isBalckTurn
            });
            this.state.isBalck !== null && this.stratTimer(data.timestamp);
        });
    }

    stratTimer(nowTimeStamp) {
        this.timmerCom.startTimeStamp(nowTimeStamp).then(() => {
            console.log('超时')
            /**
             * 如果超时了，则切换棋方
             */
            socket.emit('rushtime', {
                isBalckTurn: !this.state.isBalckTurn,//给服务器保存
                timestamp: new Date().getTime()
            });
        });
    }
    /**
     * 根据坐标获取棋盘的棋子颜色
     *
     * @param {any} x
     * @param {any} y
     * @returns
     * @memberof App
     */
    getPosDec(x, y) {
        return `${x}-${y}`;
    }
    /**
     * 落棋事件
     *
     * @memberof App
     */
    handlePlay() {
        if (this.state.isBalck === null) {
            console.log('你是旁观者')
            return;
        }

        let x = this.lastTranslateX / this.squaresWH,
            y = this.lastTranslateY / this.squaresWH,
            { board, isWin, isBalck, isBalckTurn } = this.state,
            posDec = this.getPosDec(x, y);
        if (!isWin && !board[posDec]) {
            /**
             * 如果游戏没有结束，而且改位置没有下棋，在棋盘下下黑白棋，传递数据给服务器
             */
            if (isBalck == isBalckTurn) {
                this.music.play().then(()=>{});
                let _board = { ...board },
                    curChessColor = this.getCurChessColor(isBalckTurn);

                _board[posDec] = curChessColor;

                socket.emit('play chess', {
                    x,
                    y,
                    timestamp: new Date().getTime(),
                    isBalckTurn: !this.state.isBalckTurn,//给服务器保存
                    board: { ..._board }//给服务器保存
                });
                this.timmerCom.clear();
            }
        }
    }
    /**
     * 获取当前所下棋子颜色
     *
     * @param {any} isBalckTurn
     * @returns
     * @memberof App
     */
    getCurChessColor(isBalckTurn) {
        let _isBalckTurn = isBalckTurn || this.state.isBalckTurn;
        return _isBalckTurn ? 2 : 1;//1 代表白棋， 2 代表黑棋
    }
    /**
     * 在棋盘下下黑白棋，跟服务器返回的数据设置棋子颜色
     *
     * @param {any} x
     * @param {any} y
     * @param {any} chessColor
     * @memberof App
     */
    setChess(x, y) {
        let { isBalckTurn, board } = this.state,
            _board = { ...board },
            posDec = this.getPosDec(x, y),
            curChessColor = this.getCurChessColor(isBalckTurn);

        _board[posDec] = curChessColor;

        this.setState({
            isBalckTurn: !isBalckTurn,
            board: { ..._board },
            translateX: 0,
            translateY: 0,
            lastPos: {
                x,
                y
            }
        });

        this.lastTranslateX = 0;
        this.lastTranslateY = 0;

        let winner = this.checkWinner(x, y, _board);
        if (winner) {
            setTimeout(()=> {
                this.setState({
                    isWin: winner
                });
                this.timmerCom.clear();
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
    /**
     * 重置数据
     *
     * @memberof App
     */
    reStart() {
        let restartTime = new Date().getTime();
        if (this.state.isWin) {
            socket.emit('restart', { 'restartTime': restartTime.toString()});
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
        let targetTouches = e.targetTouches[0],
            _translateX = this.lastTranslateX,
            _translateY = this.lastTranslateY,
            dx = 0,
            dy = 0
        this.endX = targetTouches.clientX || targetTouches.pageX;
        this.endY = targetTouches.clientY || targetTouches.pageY;
        dx = this.endX - this.startX;
        dy = this.endY - this.startY;
        let rawDx = _translateX + dx,
            rawDy = _translateY + dy;
        rawDx = Math.ceil(rawDx * 1 / this.squaresWH) * this.squaresWH;
        rawDx = Math.min(this.maxWH, rawDx);
        rawDx = Math.max(0, rawDx);
        rawDy = Math.ceil(rawDy * 1 / this.squaresWH) * this.squaresWH;
        rawDy = Math.min(this.maxWH, rawDy);
        rawDy = Math.max(0, rawDy);

        this.setState({
            translateX: rawDx,
            translateY: rawDy
        });
    }

    touchEnd(e) {
        e.preventDefault();
        if (this.state.isBalck == null || this.state.isBalck != this.state.isBalckTurn) return;
        this.lastTranslateX = this.state.translateX;
        this.lastTranslateY = this.state.translateY;
        console.log(this.lastTranslateX, this.lastTranslateY)
    }

    render() {
        let { lineNum, board, isWin, isBalck, member, isBalckTurn, translateX, translateY, lastPos } = this.state;
        let squares = [],
            isYourTurn = isBalck !== null && isBalck == isBalckTurn;
        for (let y = 0; y < lineNum; y++) {
            for (let x = 0; x < lineNum; x++) {
                squares.push(<Square isLastPos={lastPos && (lastPos.x == x && lastPos.y == y)} chessColor={board[this.getPosDec(x, y)]} key={`square-${x}-${y}`} />);
            }
        }
        if (isWin) {
            if ((isWin == 2 && isBalck) || (isWin == 1 && !isBalck)) {
                let successMusic = document.getElementById('success');
                successMusic.play();
            } else {
                let failMusic = document.getElementById('fail');
                failMusic.play();
            }
        }
        return (
            <div className="App">
                <header className="App-header">
                    <div className="basic">
                        <div className="basic-item">
                            <span>Your Color</span>
                            <span className={isBalck ? 'little-cicle e-black' : 'little-cicle'}></span>
                        </div>
                        <div className="basic-item">
                            <span>Turn Color</span>
                            <span className={isBalckTurn ? 'little-cicle e-black' : 'little-cicle'}></span>
                        </div>
                    </div>
                    <Timer isBalckTurn={isBalckTurn} ref={el => this.timmerCom = el} />
                </header>
                <div className="chess" onTouchStart={this.touchStart} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd}>
                    {squares}
                    {isYourTurn && <MoveSquare  chessColor={isBalck? 2 : 1} translateX={translateX} translateY={translateY}/>}
                </div>
                <div className="btn-box">
                    <a className={isWin ? 'btn' : 'btn disable'} href="javascript:;" onClick={this.reStart}>Restart</a>
                    <a className={isYourTurn ? 'btn' : 'btn disable'} href="javascript:;" onClick={this.handlePlay}>Play</a>
                    {/* <a className="btn" href="javascript:;" >悔棋</a> */}
                </div>
                <audio id="music" src={music} preload="true" hidden></audio>
                <audio id="fail" src={failMusic} preload="true" hidden></audio>
                <audio id="success" src={successMusic} preload="true" hidden></audio>
                {/* <audio id="success" src={music} hidden></audio> */}
                <Modal isWin={isWin} isBalck={isBalck}/>
            </div>
        );
    }
}


export default App;
