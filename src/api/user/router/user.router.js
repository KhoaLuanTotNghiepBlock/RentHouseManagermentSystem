const router = require('express').Router();
const UserController = require('../controller/user.controller');

const userRouter = (io) => {
    const userController = new UserController(io);

    router.get('/me/profile', userController.getProfile);

    return router;
};

module.exports = userRouter;