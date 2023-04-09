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
const invoiceService = require("../service/invoice.service");
const { getPagination } = require("../../../utils/common.helper");
const { vnp_TmnCode } = process.env;
const { vnp_HashSecret } = process.env;
const { vnp_Url } = process.env;
const { vnp_ReturnUrl } = process.env;
const { ADMIN, ACTION_TRANSFER } = require('../../../config/default');
const Notification = require("../../../model/user/notification.model");
const Contract = require("../../../model/transaction/contract.model");
const MyError = require("../../../exception/MyError");
const RentalContract = require("../blockchain/deploy/BHRentalContract");
const { compare } = require("../../../utils/object.helper");
const roomService = require("../service/room.service");

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

  // async withdrawMoney(req, res, next) {
  //   try {
  //     const ipAddr = req.headers['x-forwarded-for'] ||
  //       req.connection.remoteAddress ||
  //       req.socket.remoteAddress ||
  //       req.connection.socket.remoteAddress;
  //     const user = await User.getUserByWallet(walletAddress);
  //     const tmnCode = vnp_TmnCode;
  //     let secretKey = vnp_HashSecret;
  //     let vnpUrl = vnp_Url;
  //     const returnUrl = vnp_ReturnUrl;

  //     const date = new Date();
  //     const createDate = date.getFullYear().toString() +
  //       (date.getMonth() + 1).toString().padStart(2, '0') +
  //       date.getDate().toString().padStart(2, '0') +
  //       date.getHours().toString().padStart(2, '0') +
  //       date.getMinutes().toString().padStart(2, '0') +
  //       date.getSeconds().toString().padStart(2, '0');
  //     const orderId = new Date().toISOString().slice(0, 19).replace('T', ' ');
  //     const bankCode = 'NCB';

  //     const orderInfo = "pay for wallet";
  //     const orderType = 'topup';
  //     const locale = 'vn';
  //     const currCode = 'VND';

  //     let vnp_Params = {};
  //     vnp_Params['vnp_Version'] = '2.1.0';
  //     vnp_Params['vnp_Command'] = 'pay';
  //     vnp_Params['vnp_TmnCode'] = tmnCode;
  //     // vnp_Params['vnp_Merchant'] = ''
  //     vnp_Params['vnp_Locale'] = locale;
  //     vnp_Params['vnp_CurrCode'] = currCode;
  //     vnp_Params['vnp_TxnRef'] = user._id + new Date();
  //     vnp_Params['vnp_OrderInfo'] = user._id;
  //     vnp_Params['vnp_OrderType'] = orderType;
  //     vnp_Params['vnp_Amount'] = amount * 100;
  //     vnp_Params['vnp_ReturnUrl'] = returnUrl;
  //     vnp_Params['vnp_IpAddr'] = ipAddr;
  //     vnp_Params['vnp_CreateDate'] = createDate;
  //     if (bankCode !== null && bankCode !== '') {
  //       vnp_Params['vnp_BankCode'] = bankCode;
  //     }

  //     vnp_Params = sortObject(vnp_Params);
  //     const querystring = require('qs');
  //     let signData = querystring.stringify(vnp_Params, { encode: false });
  //     const crypto = require("crypto");
  //     const hmac = crypto.createHmac("sha512", secretKey);
  //     const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  //     vnp_Params['vnp_SecureHash'] = signed;
  //     vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  //     return res.json({ paymentUrl: vnpUrl });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

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

  //[POST] user/contract/continuous
  async continuesContract(req, res, next) {
    try {
      const { userId } = req.auth;
      const { contractId, newPeriod } = req.body;

      const data = await contractService.continueContract(userId, contractId, newPeriod);

      return res.status(200).json({
        message: "sucess",
        errorCode: 200,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  //[POST] user/contract/accept
  async acceptRequest(req, res, next) {
    try {
      const { userId } = req.auth;
      const requestId = req.params.requestId;

      const data = await userService.acceptCancelRentalRoom(userId, requestId);

      return res.status(200).json({
        message: 'success',
        errorCode: 200,
        data
      })
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

      const data = await userWalletService.changeBalance(userId, amount / 100, null, USER_TRANSACTION_ACTION.PAYMENT);
      const result = await userService.transferBalance(ADMIN._id, userId, amount / 100, ACTION_TRANSFER.TOP_UP);

      const notification = await Notification.create({
        userOwner: ADMIN._id,
        tag: [userId],
        type: 'NOTIFICATION',
        content: `You top up success full ${amount}`
      });


      vnp_Params = sortObject(vnp_Params);
      const tmnCode = vnp_TmnCode;
      let secretKey = vnp_HashSecret;

      const querystring = require('qs');
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

      res.status(200).json({
        message: 'success',
        errorCode: 200,
        data: {
          ...data,
          ...notification,
          ...result
        }
      });
    } catch (error) {
      next(error)
    }
  }

  async testPayment(req, res, next) {
    try {
      console.log('test pay ment');
      const from = await User.getById(ADMIN._id);
      const to = await User.getById("6431120c24fe4bc8bc0b828a");
      const amount = 50000;
      if (amount < 0)
        throw new MyError('amount not invalid!');

      // if (compare(from._id, to._id)) throw new MyError('can not transfer for self');
      const result = await userService.transferBalance(from._id, to._id, amount, "top up");
      res.status(200).json({
        message: 'success',
        errorCode: 200,
        data: {
          ...result
        }
      });
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
        ...{ tag: { $in: [commonHelper.toObjectId(userId)] } }
      };

      const sort = {
        createdAt: -1,
      };

      const { items, total, page, limit, totalPages } = await NotificationService.getAll(
        conditions,
        commonHelper.getPagination(req.query),
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

  //[PUT] /user/notifications/:notificationId
  async checkNotification(req, res, next) {
    try {
      const notificationId = req.params.notificationId;

      const data = await NotificationService.checkNotification(notificationId);

      return res.status(200).json({
        data,
        message: "success",
        errorCode: 200
      });

    } catch (error) {
      next(error);
    }
  }

  //[GET] /users/contract/rented
  async getContractRented(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...{ renter: commonHelper.toObjectId(userId) }
      }
      const { items, total, page, limit, totalPages } = await contractService.getAllContract(
        conditions,
        commonHelper.getPagination(req.query),
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

  //[GET] /users/contract/leased
  async getContractLeased(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        owner: userId
      }
      const populate = [
        {
          path: 'owner',
          select: '_id username name wallet avatar phone email'
        },
        {
          path: 'services',
          select: "_id name description basePrice",
        }
      ];

      const { items, total, page, limit, totalPages } = await roomService.getAllRoom(
        conditions,
        commonHelper.getPagination(req.query),
        {},
        populate,
        { createdAt: -1 }
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

  //[GET] /users/contract/:roomId
  async getContractOfRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      console.log('gau gau')
      const contract = await Contract.findOne({ room: commonHelper.toObjectId(roomId), status: "available" })
        .populate([
          {
            path: 'renter',
            select: '_id username name phone email avatar'
          },
          {
            path: 'lessor',
            select: '_id username name phone email avatar'
          },
          {
            path: 'room',
            select: "-updatedAt -lstTransaction"
          }]);

      return res.status(200).json({
        data: { contract },
        message: "success",
        errorCode: 200
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

  //[GET] /users/invoices/rented
  async getAllInvoiceRenter(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...userId,
      };

      const data = await invoiceService.getAll(
        conditions,
        getPagination(req.query),
        {}
      );

      return res.status(200).json({
        message: 'success!',
        data,
        errorCode: 200
      });
    } catch (error) {
      next(error)
    }
  }
  //[GET] /users/invoices/leased
  async getAllInvoiceOwner(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...userId,
      };

      const data = await invoiceService.getAll(
        conditions,
        getPagination(req.query),
        {},
        false,
        true
      );

      return res.status(200).json({
        message: 'success!',
        data,
        errorCode: 200
      });
    } catch (error) {
      next(error)
    }
  }

  //[GET] /users/invoices/:invoiceId
  async getInvoiceById(req, res, next) {
    try {
      const { userId } = req.auth;
      const conditions = {
        ...req.query,
        ...userId,
        ...invoiceId
      };

      const data = await invoiceService.getOne(conditions);

      return res.status(200).json({
        message: 'success!',
        data,
        errorCode: 200
      });
    } catch (error) {
      next(error)
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

  //[POST]/users/:contractId/extend-contract
  async sendRequestToExtendContract(req, res, next) {
    try {
      const { userId } = req.auth;
      const contractId = req.params.contractId;

      const data = await userService.extendContract(userId, contractId);

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

  //[POST] /users/:contractId/cancel-by-renter
  async cancelContractByLessor(req, res, next) {
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
