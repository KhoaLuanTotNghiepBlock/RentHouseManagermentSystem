const fs = require('fs');
const multer = require('multer');
const mongoHelper = require('../../../utils/mongoose.helper');
const User = require('../../../model/user/user.model');
const awss3helper = require('../../../utils/awss3.helper');

// const storage = multer.memoryStorage({
//     destination: (req, file, cb) => {
//         cb(null, "");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });
// const upload = multer({ storage, limits: { fileSize: 20000000 } }).single(
//     "file"
// );

class UserService {
    // [GET] /bh/user/me/profile
    async getProfile(_id) {
        const user = await User.findById(_id, { auth: 0 })
            .select('-updateAt')
            .populate([
                {
                    path: 'apartments',
                    select: '-updatedAt'
                }
            ]).lean().then(data => {
                return data;
            })
            .catch(err => {
                return err;
            });

        if (!user) {
            throw new Error('User ==> not found user!');
        }
        return user;

    }
};

module.exports = new UserService();

