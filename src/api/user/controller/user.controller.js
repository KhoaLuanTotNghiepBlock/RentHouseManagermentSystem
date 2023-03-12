const multer = require("multer");
const { uploadFile } = require("../../../utils/aws-s3-service.helper");
const userService = require("../service/user.service");
const addressService = require('../service/address.service');
const Street = require("../../../model/street.model");
const User = require("../../../model/user/user.model");
const axios = require('axios');

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
  async connectVNpaytoWallet(req, res,next) {
    try {
      const { walletAddress, amount } = req.body;

      // Validate the request body
      if (!walletAddress || !amount) {
        return res.status(400).json({ message: 'Request body is incomplete.', errorCode: 400, data: {} });
      }

      const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

      const createDate = dateFormat(date, 'yyyymmddHHmmss');
      const orderId = dateFormat(date, 'HHmmss');
      const bankCode = req.body.bankCode;
      const user = await User.getUserByWallet(walletAddress);

      const transactionId = Date.now().toString();

      // const response = await axios.post(vnp_Url, {
      //   vnp_Version: '2.0.0',
      //   vnp_Command: 'pay',
      //   vnp_TmnCode: vnp_TmnCode,
      //   vnp_Amount: amount * 100,
      //   vnp_CurrCode: 'VND',
      //   vnp_TxnRef: transactionId,
      //   vnp_OrderInfo: 'Payment for wallet',
      //   vnp_ReturnUrl: vnp_ReturnUrl,
      //   vnp_IpAddr: req.ip,
      //   vnp_CreateDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      //   vnp_CustomerId: user._id,
      // });

      // return res.redirect(response.data);
      
      const currCode = 'VND';
      const vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = 'Payment for wallet';
      // vnp_Params['vnp_OrderType'] = orderType;
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if(bankCode !== null && bankCode !== ''){
          vnp_Params['vnp_BankCode'] = bankCode;
      }
  
      vnp_Params = sortObject(vnp_Params);
  
      var querystring = require('qs');
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");     
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  
      res.redirect(vnpUrl)

    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req, res, next) {
    try {
      const { vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = req.body;

      // Verify the payment status
      const response = await axios.post('https://sandbox.vnpayment.vn/merchant_webapi/merchant.html', {
        vnp_Version: '2.0.0',
        vnp_TmnCode: '<your-vnpay-merchant-code>',
        vnp_Amount: vnp_Amount * 100, // VNPay accepts the amount in the smallest currency unit (in this case, Vietnamese dong)
        vnp_Command: 'querydr',
        vnp_CreateDate: new Date().toISOString().replace(/[-T:.Z]/g, ''),
        vnp_IpAddr: req.ip,
        vnp_Merchant: '<your-vnpay-merchant-name>',
        vnp_TransactionNo: vnp_TransactionNo
      });
    } catch (error) {

    }
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
