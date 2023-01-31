const authRouter = require('../router/auth.router');

const authenJWTMiddleWare = require('../middlewares/authenJWT.middleware').api;

const router = (app, io) => {
    const userRouter = require('../router/user.router')(io);

    app.use('/bh/auth', authRouter);
    app.use('/bh/users', authenJWTMiddleWare, userRouter);
};

module.exports = router;