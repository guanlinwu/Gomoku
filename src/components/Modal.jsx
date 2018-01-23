import React, { Component } from 'react';
import './Modal.css';

class Modal extends Component {
    constructor(props) {
        super(props);
    }

    show(options) {
        let { text } = options;
    }

    close() {

    }

    render() {
        let { isWin, isBalck} = this.props,
        text;
        if ((isWin == 2 && isBalck) || (isWin == 1 && !isBalck)) {
            text = 'winner is You！';
        } else {
            text ='sorry, you are failed';
        }
        return (
            <div className="Modal" style={isWin ? { display: 'block' } : { display: 'none' }}>
                <div className="messages-box">
                    <p className="messages">
                        游戏结束
                        <br />
                        {text}
                        <br />
                        请重新开始
                    </p>
                </div>
            </div>
        );
    }
}

export default Modal;
