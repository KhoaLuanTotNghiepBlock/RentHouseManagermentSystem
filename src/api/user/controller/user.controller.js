const userService = require('../service/user.service');

class UserController {
    constructor(io) {
        this.io = io;
    }

    // [GET] /bughouse/user/me/profile
    async getProfile(req, res, next) {
        const id = req.auth.userId;
        console.log("🚀 ~ file: user.controller.js:11 ~ UserController ~ getProfile ~ id", id)

        try {
            const user = await userService.getProfile(id);

            if (!user)
                return res.status(400).json(
                    {
                        message: 'Not found user!',
                        data: {},
                        errorCode: 400
                    }
                );

            return res.status(200).json(
                {
                    message: 'success',
                    data: user,
                    errorCode: 400
                }
            );
        } catch (error) {
            return res.status(400).json(
                {
                    message: error.message,
                    data: {},
                    errorCode: 400
                }
            );
        }
    }
};

module.exports = UserController;