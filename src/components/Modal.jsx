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
        let {text} = this.props;
        return (
            <div className="Modal">
                <div className="messages">游戏结束</div>
            </div>
        );
    }
}

export default Modal;
