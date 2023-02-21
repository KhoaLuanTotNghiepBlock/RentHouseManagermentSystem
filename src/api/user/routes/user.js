const router = require("express").Router();
const UserController = require("../controller/user.controller");
const swaggerJSDoc = require('swagger-jsdoc');

const userRouter = (io) => {
  const userController = new UserController(io);
  /**
   * @swagger
   * /bh/users/me/profile:
   *   get:
   *     summary: Get user profile
   *     description: Get the profile for the authenticated user
   *     tags:
   *       - User
   *     responses:
   *       200:
   *         description: user profile
   */
  router.get("/me/profile", userController.getProfile);
  router.put("/me/profile", userController.updateProfile); // not yet
  router.patch("/me/avatar", userController.changeAvatar); // not yet
  return router;
};

module.exports = userRouter;
