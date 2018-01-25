import React, { Component } from 'react';
import './Square.css';

class Square extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { chessColor } = this.props,
            colorClass = '';
        if (chessColor) {
            colorClass = (chessColor === 1 ? 'white' :  'black');
        }
        return (
            <div className={`square ${colorClass}`}>
                <div className="circle"></div>
            </div>
        );
    }
}

export class MoveSquare extends Square {
    constructor(props) {
        super(props);
    }

    render() {
        let { chessColor, translateX, translateY } = this.props,
            colorClass = '';
        if (chessColor) {
            colorClass = (chessColor === 1 ? 'white' : 'black');
        }
        return (
            <div className={`square e-move ${colorClass}`} style={{
                    transform: `translateX(${+translateX}px) translateY(${+translateY}px)`,
                    WebkitTransform: `translateX(${+translateX}px) translateY(${+translateY}px)`
                }}>
                <div className="circle"></div>
            </div>
        )
    }
}

export default Square;
