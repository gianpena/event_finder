import { createServer } from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2/promise';

const server = createServer();
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

const pool = mysql.createPool({
    host: 'socket-server-db',
    user: 'socket',
    database: 'messages',
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true
});

let rooms = {};

function broadcastToRoom(room, msgType, msg, socketToExclude = null) {
    if(!rooms[room]) return;

    rooms[room].forEach(socket => {
        if(socket === socketToExclude) return;
        socket.emit(msgType, msg);
    });
}

io.on('connection', async socket => {

    socket.on('join', msg => {
        const { room, username } = msg;
        rooms[room] = rooms[room] ?? new Set();
        rooms[room].add(socket);
        broadcastToRoom(room, 'join', { username }, socket);


        socket.on('disconnect', () => {
            rooms[room].delete(socket);
            broadcastToRoom(room, 'leave', { username });
        });

        socket.on('message', async msg => {
            broadcastToRoom(room, 'message', msg, socket);
            const { username, message } = msg;
            await pool.execute(
                'INSERT INTO message_history VALUES (?, ?, ?, NOW())',
                [room, username, message]
            );
        });



    });

});

server.listen(8080);
console.log('socket.io server listening on 8080!');