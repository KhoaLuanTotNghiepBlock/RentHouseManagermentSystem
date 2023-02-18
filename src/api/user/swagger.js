/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns a list of users
 *     description: Optional extended description in CommonMark or HTML.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 */