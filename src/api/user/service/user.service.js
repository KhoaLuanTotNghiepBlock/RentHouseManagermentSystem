require('dotenv').config();
// const multer = require("multer");
const User = require("../../../model/user/user.model");
// const awss3helper = require('../../../utils/awss3.helper');
const userValidate = require("../validate/user.validation");
const awsS3ServiceHelper = require("../../../utils/aws-s3-service.helper");
const MyError = require("../../../exception/MyError");
const ArgumentError = require("../../../exception/ArgumentError");


class UserService {
  checkImage(file) {
    const { mimetype } = file;

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") { throw new MyError("Image invalid"); }
  }

  // [GET] /bh/user/me/profile
  async getProfile(_id) {
    const user = await User.findById(_id, { auth: 0 })
      .select("-updateAt")
      .populate([
        {
          path: "apartments",
          select: "-updatedAt",
        },
      ]).lean()
      .then((data) => data)
      .catch((err) => err);

    if (!user) {
      throw new Error("User ==> not found user!");
    }
    return user;
  }

  async updateProfile(_id, profile) {
    if (!profile) { throw new Error("Profile in valid!"); }

    const validProfile = await userValidate.validateProfile(_id, profile);

    const modifieUser = await User.updateOne(
      { _id },
      {
        ...validProfile,
      },
    );

    if (modifieUser.modifiedCount < 1) throw new Error("Update user data fail!");
  }

  async changeAvatar(_id, file) {
    this.checkImage(file);

    const user = User.getById(_id);
    if (!user) {
      console.log("🚀 ~ file: user.service.js:74 ~ UserService ~ changeAvatar ~ user", user);
      throw new Error("Not found user");
    }

    const { avatar } = user;
    if (avatar) { awsS3ServiceHelper.deleteFile(avatar); }

    const avatarUrl = await awsS3ServiceHelper.uploadFile(file);
    const updateUser = await User.updateOne(
      { _id },
      {
        avatar: avatarUrl,
      },
    );
    if (updateUser.modifiedCount < 1) throw new Error("Update data fail!");
    return user;
  }

  async updateProfileByIndentity(userInfo) {
    const { name, dob, sex, identity, identityImg } = userInfo;


  }

  async connectWalletVnPay(walletInfo) {
    // const { walletAddress, amount } = walletInfo;

    // if (!walletAddress || amount)
    //   throw new ArgumentError('user service connect wallet ==>');

    // // Create a payment request with VNPay
    // // const vnpayApiKey = '<your-vnpay-api-key>';
    // // const vnpayEndpoint = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    // // const returnUrl = 'http://localhost:3000/payment-confirmation';


    // return response.data;
  }
}

module.exports = new UserService();
