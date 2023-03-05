const multer = require("multer");
const { uploadFile } = require("../../../utils/aws-s3-service.helper");
const userService = require("../service/user.service");
const addressService = require('../service/address.service');
const Street = require("../../../model/street.model");
const User = require("../../../model/user/user.model");

const { vnp_TmnCode } = process.env;
const { vnp_HashSecret } = process.env;
const { vnp_Url } = process.env;
const { vnp_ReturnUrl } = process.env;

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

  //[POST] user/wallet-connect
  async connectVNpaytoWallet(req, res) {
    try {
      const { walletAddress, amount } = req.body;

      // Validate the request body
      if (!walletAddress || !amount) {
        return res.status(400).json({ message: 'Request body is incomplete.', errorCode: 400, data: {} });
      }

      const user = await User.getUserByWallet(walletAddress);

      const transactionId = Date.now().toString();

      const response = await axios.post(vnp_Url, {
        vnp_Version: '2.0.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnp_TmnCode,
        vnp_Amount: amount * 100,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: transactionId,
        vnp_OrderInfo: 'Payment for wallet',
        vnp_ReturnUrl: vnp_ReturnUrl,
        vnp_IpAddr: req.ip,
        vnp_CreateDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        vnp_CustomerId: user._id,
      });

      return res.redirect(response.data);

    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req, res, next) {

  }



  // [GET] /user/me/profile

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
