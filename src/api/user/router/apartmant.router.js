const ApartmentController = require("../controller/apartment.controller");
const router = require('express').Router();
const apartmentController = require('../controller/apartment.controller');

router.post('/create-apartment', apartmentController.createApartment);

module.exports = router;

