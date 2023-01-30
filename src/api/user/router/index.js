const authRouter = require('../router/auth.router');

const authenJWTMiddleWare = require('../middlewares/authenJWT.middleware');

const router = (app, io) => {
    app.use('/bh/auth', authRouter);
};

module.exports = router;