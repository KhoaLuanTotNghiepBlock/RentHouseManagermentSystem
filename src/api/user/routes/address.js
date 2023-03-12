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

/**
 * @swagger
 * /bh/address/wards/{districtName}:
 *   get:
 *     summary: Get wards by district name
 *     description: Retrieve a list of wards by district name
 *     tags:
 *       - Address
 *     parameters:
 *       - in: path
 *         name: districtName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the district to retrieve wards from
 *     responses:
 *       200:
 *         description: List of wards successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 errorCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     wards:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "10"
 *       400:
 *         description: Invalid request parameter(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameter(s)"
 *                 errorCode:
 *                   type: integer
 *                   example: 400
 *                 data:
 *                   type: object
 *                   example: {}
 */
router.get('/wards/:ditrictName', addressController.getWard);

/**
 * @swagger
 * /bh/address/streets/{districtName}:
 *   get:
 *     summary: Get all streets in a district
 *     description: Retrieve all streets in a district
 *     tags:
 *       - Address
 *     parameters:
 *       - in: path
 *         name: districtName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the district to retrieve streets from
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: success message
 *                   example: success
 *                 errorCode:
 *                   type: integer
 *                   description: error code
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     streets:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: street name
 *                         example: "Nguyen Van Troi"
 *       400:
 *         description: Invalid input parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: error message
 *                   example: Invalid input parameter
 *                 errorCode:
 *                   type: integer
 *                   description: error code
 *                   example: 400
 */
router.get('/streets/:ditrictName', addressController.getStreet);

module.exports = router;
