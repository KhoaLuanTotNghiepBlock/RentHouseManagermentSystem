const authRouter = require("./auth.router");
const apartmentRouter = require('../router/apartmant.router');
const serviceRouter = require('../router/service.router');
const authenJWTMiddleWare = require("../middlewares/authenJWT.middleware").api;

const router = (app, io) => {
  const userRouter = require("./user.router")(io);

  app.use("/bh/auth", authRouter);
  app.use("/bh/users", authenJWTMiddleWare, userRouter);
  app.use("/bh/apartment", authenJWTMiddleWare, apartmentRouter);
  app.use("/bh/service", authenJWTMiddleWare, serviceRouter);
};

module.exports = router;
