const router = require("express").Router();
const UserController = require("../controller/user.controller");
const unauthorizeRouter = (io) => {
  const userController = new UserController(io);
  router.get("/payment-confirmation", userController.confirmPayment);
  return router;
};

module.exports = unauthorizeRouter;