const authRouter = require("./auth");
const serviceRouter = require('./service');
const roomRouter = require('./room');
const addressRouter = require('./address');
const contractRouter = require('./contract');
const invoiceRouter = require('../routes/invoice');

const authenJWTMiddleWare = require("../middlewares/authenJWT.middleware").api;

const router = (app, io) => {
  const userRouter = require("./user")(io);
  const unAuthorizeRouter = require('./unauthorize')(io);
  app.use("/bh/auth", authRouter);
  app.use("/bh", unAuthorizeRouter);
  app.use("/bh/users", authenJWTMiddleWare, userRouter);
  app.use("/bh/room", authenJWTMiddleWare, roomRouter);
  app.use("/bh/address", authenJWTMiddleWare, addressRouter);
  app.use("/bh/contract", authenJWTMiddleWare, contractRouter);
  app.use("/bh/invoice", authenJWTMiddleWare, invoiceRouter);
  app.use("/bh/service", authenJWTMiddleWare, serviceRouter);
};
/**
 * @swagger
 * components:
 *  schemas: 
 *    user: 
 *       description: user in bughouse
 *       type: object
 *       properties:
 *          username:
 *            type: string
 *          email: 
 *            type: string
 *          phone: 
 *            type: string
 *          identity:
 *            type:string
 *          auth:
 *            type: object
 *            properties:
 *              password: 
 *                type: string
 *              isAdmin:
 *                type: string
 *              isVerified:
 *                type: string
 *              remainingTime:
 *                type: boolean
 *          name:
 *            type: string
 *          gender:
 *            type: string
 *          dob:
 *            type: date
 *          avatar:
 *            
 *            
 *    enum:
 *      - black
 *      - white
 */
module.exports = router;
