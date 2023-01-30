const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const socket = require('../../config/sockect');
const db = require('../../config/database');

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
const useragent = require('express-useragent');
const routers = require('../user/router');

db.connect(process.env.DATABASE_CONNECTION);

app.use(cors());
app.use(useragent.express());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// socket
const server = require('http').Server(app);
const io = socketio(server);
socket(io);
routers(app, io);

server.listen(PORT, HOST, () => {
    console.log(`User server is running in http://${HOST}:${PORT}`);
});