const router = require('express').Router();
const addressController = require('../controller/address.controller');

router.get('/ditricts', addressController.getDitrict);
router.get('/wards/:ditrictName', addressController.getWard);
router.get('/streets/:ditrictName', addressController.getStreet);

module.exports = router;
