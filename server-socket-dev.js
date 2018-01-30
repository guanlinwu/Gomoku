var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var peopleNum = 0,
    // isBalck = true,
    isBalckTurn = true,
    firstPlace = null,
    secPlace = null,
    board = {},
    timestamp = 0;

server.listen(3002, function () {
    console.log('listening on :3002');
});

io.on('connection', function (socket) {

    socket.on('login', function (data) {
        console.log(socket.id, 'connected');
        console.log(data);
        peopleNum++;
        if (timestamp == 0) {
            timestamp = new Date().getTime();
        }
        console.log('peopleNum: ' + peopleNum)
        if (firstPlace == null) {
            firstPlace = socket.id;
            io.to(socket.id).emit('role', { isBalck: true, isBalckTurn: isBalckTurn, board: board, timestamp: timestamp});
        } else if (secPlace == null) {
            secPlace = socket.id;
            io.to(socket.id).emit('role', { isBalck: false, isBalckTurn: isBalckTurn, board: board, timestamp: timestamp });
        }

    });

    socket.on('play chess', function (data) {
        console.log('play chess' + data.x + '-' + data.y + ' isBalckturn ' + data.isBalckTurn);
        board = data.board;
        isBalckTurn = data.isBalckTurn;
        timestamp = data.timestamp;
        io.emit('play chess', data);
    });

    socket.on('rushtime', function (data) {
        console.log('rushtime isBalckturn ' + data.isBalckTurn);
        isBalckTurn = data.isBalckTurn;
        timestamp = data.timestamp;
        io.emit('rushtime', data);
    });

    socket.on('restart', function (data) {
        console.log('restart');
        isBalckTurn = true;
        board = {};
        data.timestamp = new Date().getTime();
        timestamp = data.timestamp;
        io.emit('restart', data);
    });

    socket.on('disconnect', function () {
        console.log(socket.id, 'disconnected');
        if (socket.id == firstPlace) {
            firstPlace = null;
        } else {
            secPlace = null;
        }
        if (firstPlace == null && secPlace == null) {
            timestamp = 0;
        }
        peopleNum--;
        peopleNum < 0 && (peopleNum = 0);
    });
});