const multer = require("multer");
const userService = require("../service/user.service");
const addressService = require('../service/address.service');
const notificationService = require('../service/notification.service');
const requestService = require('../service/request.service');
const Street = require("../../../model/street.model");
const User = require("../../../model/user/user.model");
const axios = require('axios');
const userWalletService = require("../service/user-wallet.service");
const { USER_TRANSACTION_ACTION } = require('../../../config/user-transaction')
const commonHelper = require('../../../utils/common.helper');
const contractService = require("../service/contract.service");
const NotificationService = require("../service/notification.service");
const RequestService = require("../service/request.service");
const { vnp_TmnCode } = process.env;
const { vnp_HashSecret } = process.env;
const { vnp_Url } = process.env;
const { vnp_ReturnUrl } = process.env;


const sortObject = (obj) => {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

class UserController {
  constructor(io) {
    this.io = io;
  }

  //[POST] user/wallet-connect
  async connectVNpaytoWallet(req, res, next) {
    try {
      const { walletAddress, amount } = req.body;
      // const { walletAddress, amount } = { walletAddress: "0x7b54ea3b6f9Ed4D80925D7d6C7E820C4e245818d", amount: 100000 };
      // Validate the request body
      if (!walletAddress || !amount) {
        return res.status(400).json({ message: 'Request body is incomplete.', errorCode: 400, data: {} });
      }
      const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const user = await User.getUserByWallet(walletAddress);
      const tmnCode = vnp_TmnCode;
      let secretKey = vnp_HashSecret;
      let vnpUrl = vnp_Url;
      const returnUrl = vnp_ReturnUrl;

      const date = new Date();
      const createDate = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0') +
        date.getHours().toString().padStart(2, '0') +
        date.getMinutes().toString().padStart(2, '0') +
        date.getSeconds().toString().padStart(2, '0');
      const orderId = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const bankCode = 'NCB';

      const orderInfo = "pay for wallet";
      const orderType = 'topup';
      const locale = 'vn';
      const currCode = 'VND';

      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = user._id + new Date();
      vnp_Params['vnp_OrderInfo'] = user._id;
      vnp_Params['vnp_OrderType'] = orderType;
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);
      const querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

      return res.json({ paymentUrl: vnpUrl });
    } catch (error) {
      next(error);
    }
  }

  //[POST] user/contract/:contractId/cancel-by-renter
  async cancelByRenter(req, res, next) {
    try {
      const { userId } = req.auth;
      const contractId = req.params.contractId;

      const data = await contractService.cancelContractByRenter(userId, contractId);

      return res.status(200).json({
        message: "cancel sucess",
        errorCode: 200,
        data
      });

    } catch (error) {
      next(error);
    }
  }

  //[POST] user/contract/:requestId
  async acceptRequest(req, res, next) {
    try {
      const { userId } = req.auth;
      const requestId = req.params.requestId;

      const data = await userService.acceptRequest(userId, requestId);
    } catch (error) {
      next(error);
    }
  }
  async confirmPayment(req, res, next) {
    try {
      let vnp_Params = req.query;

      const secureHash = vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
      const amount = vnp_Params["vnp_Amount"];
      const userId = vnp_Params["vnp_OrderInfo"];

      const data = await userWalletService.changeBalance(userId, amount, null, USER_TRANSACTION_ACTION.PAYMENT);

      vnp_Params = sortObject(vnp_Params);
      const tmnCode = vnp_TmnCode;
      let secretKey = vnp_HashSecret;

      const querystring = require('qs');
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

      if (secureHash === signed) {
        res.status(200).json({
          message: 'success',
          errorCode: 200,
          data
        })
      } else {
        res.status(200).json({
          message: 'success',
          errorCode: 200,
          data
        })
      }
    } catch (error) {
      next(error)
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

  // [GET] /user/me/wallet
  async getWallet(req, res, next) {
    const id = req.auth.userId;
    try {
      const wallet = await userWalletService.getBalance(id);

      return res.status(200).json(
        {
          message: "success",
          data: wallet,
          errorCode: 200,
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

  // [GET] /user/me/transaction-history
  async getTransactionHistory(req, res, next) {
    try {
      const conditions = {
        ...req.query
      };
      const sort = {
        createdAt: -1,
      };
      const projection = {};
      const populate = [
        {
          path: 'userId',
          select: '_id username email phone identity name avatar'
        },
      ]

      const { items, total, page, limit, totalPages } = await userWalletService.getTransactionHistory(
        conditions,
        commonHelper.getPagination(req.query),
        projection,
        populate,
        sort,
      );
      return res.status(200).json({
        data: { items, total, page, limit, totalPages },
        message: "success",
        errorCode: 200
      });

    } catch (error) {
      next(error);
    }
  }

  // [GET] /user/notifications
  async getNotification(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        receiveUser: userId
      };
      const sort = {
        createdAt: -1,
      };

      const { items, total, page, limit, totalPages } = await NotificationService.getListNotification(
        conditions,
        commonHelper.getPagination(req.query),
        projection,
        sort,
      );

      return res.status(200).json({
        items,
        total,
        page,
        limit,
        totalPages
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /user/requests
  async getRequests(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        to: userId
      };
      const sort = {
        createdAt: -1,
      };

      const { items, total, page, limit, totalPages } = await RequestService.getAllRequest(
        conditions,
        commonHelper.getPagination(req.query),
        projection,
        sort,
      );

      return res.status(200).json({
        items,
        total,
        page,
        limit,
        totalPages
      });
    } catch (error) {
      next(error);
    }
  }
  // [PUT] /bh/user/me/profile
  async updateProfile(req, res, next) {
    const userId = req.auth.userId;
    const { name, dob, sex, id, identityImg, home, address_entities } = req.body;
    try {
      const data = await userService.updateProfileByIndentity(userId, { name, dob, sex, id, identityImg, home, address_entities });

      res.status(200).json({
        message: "Update user profile success",
        errorCode: 200,
        data
      });
    } catch (error) {
      next(error);
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

      });
    } catch (error) {

    }
  }

  //[GET] /users/notifications
  async getUserNotification(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...{ receiceUser: userId }
      };
      const sort = { createdAt: -1 };

      const { items, total, page, limit, totalPages } = await notificationService.getAll(
        conditions,
        commonHelper.getPagination(req.query),
        {},
        sort,
      );

      return res.status(200).json({
        data: { items, total, page, limit, totalPages },
        message: "success",
        errorCode: 200
      });

    } catch (error) {
      next(error);
    }
  }

  //[GET] /users/requests
  async getUserRequest(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...{ to: userId }
      };
      const sort = { createdAt: -1 };

      const { items, total, page, limit, totalPages } = await requestService.getAll(
        conditions,
        commonHelper.getPagination(req.query),
        {},
        sort,
      );
      return res.status(200).json({
        data: { items, total, page, limit, totalPages },
        message: "success",
        errorCode: 200
      });

    } catch (error) {
      next(error);
    }
  }


  //[POST]/users/:contractId/cancel-by-renter
  async sendRequestToCancel(req, res, next) {
    try {
      const { userId } = req.auth;
      const contractId = req.params.contractId;

      const data = await userService.cancelRentalByRenter(userId, contractId);
      return res.status(200).json({
        message: 'send request success!',
        data,
        errorCode: 200
      });
    } catch (error) {
      next(error)
    }
  }

  // [POST] /user/accept-cancel-rental
  async acceptCancelRental(req, res, next) {
    try {
      const { userId } = req.auth;

      const data = await userService.acceptCancelRentalRoom(userId);

      return res.status(200).json({
        message: 'end rent success',
        errorCode: 200,
        data
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = UserController;
