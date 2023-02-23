const authRouter = require("./auth");
const serviceRouter = require('./service');
const roomRouter = require('./room');
const addressRouter = require('./address');
const contractRouter = require('./contract');
const invoiceRouter = require('../routes/invoice');
const authenJWTMiddleWare = require("../middlewares/authenJWT.middleware").api;

const router = (app, io) => {
  const userRouter = require("./user")(io);
  app.use("/bh/auth", authRouter);
  app.use("/bh/users", authenJWTMiddleWare, userRouter);
  app.use("/bh/room", authenJWTMiddleWare, roomRouter);
  app.use("/bh/address", authenJWTMiddleWare, addressRouter);
  app.use("/bh/contract", authenJWTMiddleWare, contractRouter);
  app.use("/bh/invoice", authenJWTMiddleWare, invoiceRouter);
  app.use("/bh/service", authenJWTMiddleWare, serviceRouter);
};

module.exports = router;
