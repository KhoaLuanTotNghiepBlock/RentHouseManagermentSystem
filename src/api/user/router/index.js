const authRouter = require("./auth.router");
const serviceRouter = require('../router/service.router');
const roomRouter = require('../router/room.router');
const addressRouter = require('../router/address.router');
const contractRouter = require('./contract.router');
const authenJWTMiddleWare = require("../middlewares/authenJWT.middleware").api;

const router = (app, io) => {
  const userRouter = require("./user.router")(io);

  app.use("/bh/auth", authRouter);
  app.use("/bh/users", authenJWTMiddleWare, userRouter);
  app.use("/bh/room", authenJWTMiddleWare, roomRouter);
  app.use("/bh/address", authenJWTMiddleWare, addressRouter);
  app.use("/bh/contract", authenJWTMiddleWare, contractRouter);
  app.use("/bh/service", authenJWTMiddleWare, serviceRouter);
};

module.exports = router;
