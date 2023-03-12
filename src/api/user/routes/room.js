const router = require('express').Router();
const RoomController = require('../controller/room.controller');

/**
 * @swagger
 * /bh/room/create-room:
 *   post:
 *     summary: Create a new room for rent
 *     tags:
 *       - Room
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: New room data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       '200':
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRoomResponse'
 *       '400':
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

components:
  schemas:
    CreateRoomRequest:
      type: object
      properties:
        name:
          type: string
          description: Name of the room
        description:
          type: string
          description: Description of the room
        basePrice:
          type: number
          description: Base price of the room
        acreage:
          type: number
          description: Area of the room in square meters
        typeRoom:
          type: string
          enum: ['ROOM_FOR_RENT']
          description: Type of the room
        nbCurrentPeople:
          type: integer
          description: Number of current occupants in the room
        totalNbPeople:
          type: integer
          description: Maximum number of occupants in the room
        deposit:
          type: number
          description: Deposit required to rent the room
        gender:
          type: string
          enum: ['All', 'Male', 'Female']
          description: Gender of the occupants allowed in the room
        cityName:
          type: string
          description: Name of the city where the room is located
        ditrictName:
          type: string
          description: Name of the district where the room is located
        streetName:
          type: string
          description: Name of the street where the room is located
        wardName:
          type: string
          description: Name of the ward where the room is located
        addressDetail:
          type: string
          description: Detailed address of the room
        roomAttachment:
          type: object
          properties:
            url:
              type: array
              items:
                type: string
              description: List of URLs of the room attachments
          description: Attachments of the room
        amentilities:
          type: array
          items:
            type: string
            enum: ['isWifi', 'isCamera', 'isParking', 'isFrigde', 'isWasingMachine', 'isAirCoditional']
          description: Amenities of the room
        services:
          type: array
          items:
            $ref: '#/components/schemas/Service'
          description: List of services provided with the room

    Service:
      type: object
      properties:
        name:
          type: string
          description: Name of the service
        description:
          type: string
          description: Description of the service

router.post('/create-room', RoomController.createRoomForRent);

module.exports = router;