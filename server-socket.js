var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var peopleNum = 0,
    isBalck = true,
    firstPlace = null,
    secPlace = null

server.listen(3002, function () {
    console.log('listening on :3002');
});

io.on('connection', function (socket) {

    socket.on('login', function (data) {
        console.log(socket.id, 'connected');
        console.log(data);
        peopleNum++;
        console.log('peopleNum: ' + peopleNum)
        if (firstPlace == null) {
            firstPlace = socket.id;
            io.to(socket.id).emit('role', { isBalck: true });
        } else if (secPlace == null) {
            secPlace = socket.id;
            io.to(socket.id).emit('role', { isBalck: false });
        }

    });

    socket.on('play chess', function (data) {
        console.log('play chess' + data.x + '-' + data.y + ' isBalckturn ' + data.isBalckTurn);
        io.emit('play chess', data);
    });

    socket.on('restart', function (data) {
        console.log('restart');
        io.emit('restart', data);
    });

    socket.on('disconnect', function () {
        console.log(socket.id, 'disconnected');
        if (socket.id == firstPlace) {
            firstPlace = null;
        } else {
            secPlace = null;
        }

        peopleNum--;
        peopleNum < 0 && (peopleNum = 0);
    });
});