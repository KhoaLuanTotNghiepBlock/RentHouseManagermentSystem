dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const useragent = require("express-useragent");
const socket = require("../../config/sockect");
const db = require("../../config/database");
const swagger = require('./swagger');

const { PORT } = process.env;
const { HOST } = process.env;

const app = express();

swagger(app);
// Set api-doc path

const server = require("http").Server(app);
const routers = require("./routes");

db.connect(process.env.DATABASE_CONNECTION);

app.use(cors());
app.use(useragent.express());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
// socket

const io = socketio(server);
socket(io);
routers(app, io);

server.listen(PORT, HOST, () => {
  console.log(`User server is running in http://${HOST}:${PORT}`);
});
