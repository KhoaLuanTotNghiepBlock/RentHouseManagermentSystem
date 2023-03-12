const router = require('express').Router();
const contractController = require('../controller/contract.controller');

/**
 * @swagger
 * /bh/contract/create-contract:
 *   post:
 *     summary: Create a new contract
 *     tags:
 *       - Contract
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Access token to authorize the request
 *         required: true
 *         type: string
 *     requestBody:
 *       description: Request body for creating a new contract
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: number
 *                 description: The duration of the contract (in months)
 *               room:
 *                 type: string
 *                 description: the id info of room for rent
 *               payment:
 *                 type: number
 *                 description: The price of the contract
 *               dateRent:
 *                 type: date-time
 *                 description: the day create contract 
 *               payTime:
 *                 type: date-time
 *                 description: the day pay for contract
 *               payMode:
 *                  type: string
 *                  description: the way user pay for contract
 *               renterInfo:
 *                  type: string
 *                  description: the id info of user who want to rent room
 *             example:
 *               period: 6
 *               room: "640376efcf8fb7daaa7d8b25"
 *               dateRent: "20/02/2023"
 *               payTime: "20/02/2023"
 *               payment: 50000
 *               payMode: "VNPay"
 *               renterInfo: "640373e77ecb0c7ed28ed90e"
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success message with data of created contract
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the created contract
 *                     lessor:
 *                       type: string
 *                       description: The ID of the owner of the created contract
 *                     room:
 *                       type: string
 *                       description: The ID of the room
 *                     dateRent:
 *                       type: date-time
 *                       description: the day create contract 
 *                     payment:
 *                       type: number
 *                       description: The price of the contract
 *                     payTime:
 *                       type: date-time
 *                       description: the day pay for contract
 *                     payMode:
 *                       type: string
 *                       description: the way user pay for contract
 *                     period:
 *                       type: number
 *                       description: The duration of the contract (in months)
 *                     enable:
 *                       type: boolean
 *                       description: the status of contract
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time when the contract was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time when the contract was last updated
 *             example:
 *               message: "create contract success"
 *               errorCode: 200
 *               data:
 *                 "period": 6
 *                 "renter": "640373e77ecb0c7ed28ed90e"
 *                 "room": "640376efcf8fb7daaa7d8b25"
 *                 "dateRent": "2023-02-19T17:00:00.000Z"
 *                 "payTime": "2023-02-19T17:00:00.000Z" 
 *                 "payMode": "VNPay"
 *                 "payment": 50000
 *                 "enable": true
 *                 "_id": "64037d570a1ec6c547b2f3af"
 *                 "lessor": "640374297ecb0c7ed28ed914"
 *                 "createdAt": "2023-03-05T00:18:15.495Z"
 *                 "updatedAt": "2023-03-04T17:18:15.495Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/create-contract', contractController.createContract);
router.post('/create-smart-contract', contractController.createSmartContract);

router.get('/:renterId', contractController.getContractByRenter);
router.get('/smart-contract/:contractAddress', contractController.getSmartContract);
module.exports = router; 