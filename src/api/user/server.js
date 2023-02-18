dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const socketio = require("socket.io");
const useragent = require("express-useragent");
const socket = require("../../config/sockect");
const db = require("../../config/database");
// const router = require('../router/*.js');
const { PORT } = process.env;
const { HOST } = process.env;

const app = express();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bughouse API with Swagger",
      version: "0.1.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ['./router'],
};

const specs = swaggerJsdoc(options);

const server = require("http").Server(app);
const routers = require("./router");

db.connect(process.env.DATABASE_CONNECTION);

app.use(cors());
app.use(useragent.express());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
// socket

const io = socketio(server);
socket(io);
routers(app, io);

//visit http://localhost:3000/api-docs see doc of api
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

server.listen(PORT, HOST, () => {
  console.log(`User server is running in http://${HOST}:${PORT}`);
});
