import { createServer } from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';

const server = createServer();
const allowed_origins = ['http://localhost:3000', 'http://eventfinder.gianpena.xyz:3003'];

const io = new Server(server, {
    cors: {
        origin: allowed_origins
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
        const { room, username, avatarUrl } = msg;
        rooms[room] = rooms[room] ?? new Set();
        rooms[room].add(socket);
        broadcastToRoom(room, 'join', { username, avatarUrl }, socket);


        socket.on('disconnect', () => {
            rooms[room].delete(socket);
            broadcastToRoom(room, 'leave', { username, avatarUrl });
        });

        socket.on('message', async msg => {
            broadcastToRoom(room, 'message', msg, socket);
            const { username, message } = msg;
            await pool.execute(
                'INSERT INTO message_history VALUES (?, ?, ?, ?, NOW())',
                [room, username, message, avatarUrl]
            );
        });



    });

});

server.listen(8080);
console.log('socket.io server listening on 8080!');

const httpServer = express();
httpServer.use(cors({
    origin: allowed_origins
}));
httpServer.use(express.json());

httpServer.get('/messages', async (req, res) => {
    const { event } = req.query;
    const [rows] = await pool.execute(
        'SELECT * FROM message_history WHERE room_id = ? ORDER BY timestamp ASC',
        [event]
    );

    res.status(200).json(rows);
});

httpServer.listen(8081);
