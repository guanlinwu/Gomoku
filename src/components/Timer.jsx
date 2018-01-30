import React, { Component } from 'react';
import './Timer.css';
import { resolve } from 'url';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.total = 20;
        this.state = {
            time: this.total//倒计时
        };

        this.start = this.start.bind(this);
        this.startTimeStamp = this.startTimeStamp.bind(this);
        this.clear = this.clear.bind(this);
    }

    start() {
        return new Promise((resolve, reject) => {
            let { time } = this.state;
            if (this.timer) {
                this.clear();
            }

            this.timer = setInterval(() => {
                if (this.state.time <= 1) {
                    //end
                    this.clear();
                    resolve();
                } else {
                    time--;
                    this.setState({
                        time
                    });
                }
            }, 1000);
        });
    }

    startTimeStamp(timeStamp) {
        return new Promise((resolve, reject) => {
            let { time } = this.state;
            if (this.timer) {
                this.clear();
            }

            this.timer = setInterval(() => {
                let now = new Date().getTime(),
                    remain = now - timeStamp,
                    sec = Math.floor(remain / 1000 % 60);
                time = this.total - sec;

                if (time <= 1) {
                    //end
                    this.clear();
                    resolve();
                } else {
                    this.setState({
                        time
                    });
                }
            }, 1000);
        });
    }

    clear() {
        clearInterval(this.timer);
        this.timer = null;
        this.setState({
            time: this.total//倒计时
        });
    }

    render() {
        let { time } = this.state;
        let { isBalckTurn } = this.props;
        return (
            <div className={isBalckTurn ? 'timer e-black' : 'timer'}>
                <p className="time-text">{time}</p>
            </div>
        );
    }

}