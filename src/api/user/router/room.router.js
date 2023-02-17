const router = require('express').Router();
const RoomController = require('../controller/room.controller');

router.post('/create-room', RoomController.createRoomForRent);

module.exports = router;