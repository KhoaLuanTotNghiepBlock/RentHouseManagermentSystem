const router = require('express').Router();
const addressController = require('../controller/address.controller');

/**
 * @swagger
 * /bh/address/ditricts:
 *   get:
 *     summary: get info all ditricts
 *     description: Get the profile for the authenticated user
 *     tags:
 *       - Address
 *     responses:
 *       200:
 *         description:user proifile to 
 */
router.get('/ditricts', addressController.getDitrict);
router.get('/wards/:ditrictName', addressController.getWard);
router.get('/streets/:ditrictName', addressController.getStreet);

module.exports = router;
