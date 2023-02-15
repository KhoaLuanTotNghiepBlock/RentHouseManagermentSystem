const router = require('express').Router();
const serviceApartmentController = require('../controller/service.controller');

router.post('/unit/create-unit', serviceApartmentController.createUnit);
router.get('/unit', serviceApartmentController.getAllUnit);

module.exports = router;