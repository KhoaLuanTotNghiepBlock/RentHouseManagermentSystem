const multer = require("multer");
const { uploadFile } = require("../../../utils/aws-s3-service.helper");
const userService = require("../service/user.service");
const addressService = require('../service/address.service');
const Street = require("../../../model/street.model");

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20000000 } }).single(
  "file",
);

class UserController {
  constructor(io) {
    this.io = io;
  }

  // [GET] /bughouse/user/me/profile
  async getProfile(req, res, next) {
    const id = req.auth.userId;
    try {
      const user = await userService.getProfile(id);


      if (!user) {
        return res.status(400).json(
          {
            message: "Not found user!",
            data: {},
            errorCode: 400,
          },
        );
      }

      return res.status(200).json(
        {
          message: "success",
          data: user,
          errorCode: 400,
        },
      );
    } catch (error) {
      return res.status(400).json(
        {
          message: error.message,
          data: {},
          errorCode: 400,
        },
      );
    }
  }

  // [PUT] /bh/user/me/profile
  async updateProfile(req, res, next) {
    const id = req.auth.userId;
    try {
      await userService.updateProfile(id, req.body);
      res.status(200).json({
        message: "Update user profile success",
        errorCode: 200,
        data: {},
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
        errorCode: 400,
        data: {},
      });
      next();
    }
  }

  // [PATCH] /bh/user/me/avatar
  async changeAvatar(req, res, next) {
    try {
      upload(req, res, async (err) => {
        const { file } = req;
        const id = req.auth.userId;

        if (!file) throw new Error("Upload avatar => file not found1");

        const user = await userService.changeAvatar(id, file);
        if (!user) { throw new Error("Update avatar => change avatar fail!"); }

        ww;
      });
    } catch (error) {

    }
  }
}

module.exports = UserController;
