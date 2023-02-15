dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const useragent = require("express-useragent");
const db = require("../../config/database");

const PORT = 7070;
const app = express();
const server = require("http").Server(app);
const routers = require("./router");

db.connect(process.env.DATABASE_CONNECTION);

app.use(cors());
app.use(useragent.express());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// socket

routers(app);

server.listen(PORT, () => {
    console.log(`Admin server is running in http://localhost:${PORT}`);
});
