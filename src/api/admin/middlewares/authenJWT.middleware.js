dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.model');
const NotFoundError = require('../../../exception/NotFoundError');
const AuthenError = require('../../../exception/AuthenError');

module.exports = async (req, res, next) => {
    try {
        let token = req.headers['authorization'] || req.headers.authorization;;
        if (!token) throw new Error('Token is not provided');

        let payload = await jwt.verify(token, process.env.SECRET_KEY);
        if (!payload.isAdmin) throw new AuthenError('User');
        else
            req.auth = payload;
        if (
            !(await User.exists({
                _id: payload.userId,
                deleted: false
            }))
        )
            throw new NotFoundError('User is disabled or deleted');
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            errorCode: 401,
            message: 'Unauthorized',
            action: error.name === 'Error' ? 'logout' : 'refresh'
        });
    }
}