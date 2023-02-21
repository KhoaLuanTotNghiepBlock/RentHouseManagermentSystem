const router = require('express').Router();
const RoomController = require('../controller/room.controller');

/**
   * @swagger
   * /bh/room/create-room:
   *   post:
   *     summary: Example API endpoint
   *     responses:
   *       200:
   *         description: Successful response
   */
router.post('/create-room', RoomController.createRoomForRent);

module.exports = router;