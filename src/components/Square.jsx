import React, { Component } from 'react';
import './Square.css';

class Square extends Component {
    constructor(props) {
        super(props);
        this.palyChess = this.palyChess.bind(this);
    }
    palyChess() {
        let { coord, playChess, chessColor, isWin } = this.props;
        if (!isWin && !chessColor) {
            playChess(coord.x, coord.y);
        }
    }
    render() {
        let { chessColor } = this.props,
            colorClass = '';
        if (chessColor) {
            colorClass = (chessColor === 1 ? 'white' :  'black');
        }
        return (
            <div className="square">
                <div className={`circle ${colorClass}`} onClick={this.palyChess}></div>
            </div>
        );
    }
}

export default Square;
