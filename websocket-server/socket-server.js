import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const io = new Server(server);

io.on('connection', async socket => {
    const id = socket.id;
    console.log(`Client connected: ${id}`);
    socket.broadcast.emit('join', { id });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${id}`);
        io.emit('leave', { id });
    });

    socket.on('message', msg => {
        socket.broadcast.emit('message', msg);
        // TODO: record message in database
    });
});

server.listen(8080);