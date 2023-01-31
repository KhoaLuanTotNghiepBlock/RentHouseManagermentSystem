const router = require('express').Router();
const UserController = require('../controller/user.controller');

const userRouter = (io) => {
    const userController = new UserController(io);

    router.get('/me/profile', userController.getProfile);
    router.put('/me/profile', userController.updateProfile); // not yet
    router.patch('/me/avatar', userController.changeAvatar); // not yet
    return router;
};

module.exports = userRouter;