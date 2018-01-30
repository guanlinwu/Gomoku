import React from 'react';
import './Square.css';

export const Square = (props) => {
    let { chessColor, isLastPos  } = props,
        colorClass = '';
    if (chessColor) {
        colorClass = (chessColor === 1 ? 'white' :  'black');
    }
    isLastPos && (colorClass += ' e-last-pos');
    return (
        <div className={`square ${colorClass}`}>
            <div className="circle"></div>
        </div>
    );
}

export const MoveSquare = (props) => {

    let { chessColor, translateX, translateY} = props,
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

