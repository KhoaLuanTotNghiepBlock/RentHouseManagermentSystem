require('dotenv').config();
// const multer = require("multer");
const User = require("../../../model/user/user.model");
// const awss3helper = require('../../../utils/awss3.helper');
const userValidate = require("../validate/user.validation");
const awsS3ServiceHelper = require("../../../utils/aws-s3-service.helper");
const MyError = require("../../../exception/MyError");
const ArgumentError = require("../../../exception/ArgumentError");
const commonHelper = require('../../../utils/common.helper');
const City = require('../../../model/city.model');
const addressService = require('./address.service');
const District = require('../../../model/ditrict.model');
const Street = require('../../../model/street.model');
const Ward = require('../../../model/ward.model');
const TokenTransaction = require('../../../model/transaction/token-transaction.model');
const Request = require('../../../model/user/request.model');

class UserService {
  checkImage(file) {
    const { mimetype } = file;

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") { throw new MyError("Image invalid"); }
  }

  async cityData() {
    const listDitrict = await addressService.getDitrictsFromDatabase();
    const city = await City.findOne({ _id: "6415ee77cc372ede59b64c1a" })
    // add drestirct
    // for (let i = 0; i < listDitrict.length; i++) {
    //   const ditrict = new District({
    //     name: listDitrict[i].name,
    //     type: listDitrict[i].pre,
    //     typename: `${listDitrict[i].pre} ${listDitrict[i].name}`,
    //     parent_code: city._id
    //   });
    //   await ditrict.save();
    // }

    for (let i = 0; i < listDitrict.length; i++) {
      const list = await addressService.getWardByDitrict(listDitrict[i].name)
      for (let j = 0; j < list.length; j++) {
        const ward = new Ward({
          name: list[j].name,
          type: list[j].pre,
          typename: `${list[j].pre} ${list[j].name}`,
          parent_code: listDitrict[i]._id,
          parent_code_city: city._id
        });
        await ward.save();
      }
    }
  }

  // [GET] /bh/user/me/profile
  async getProfile(_id) {
    await tokens.save();
    const user = await User.findById(_id, { auth: 0 })
      .select("-updateAt")
      .lean()
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

  async acceptRequest(userId, requestId) {
    // get user
    const user = await User.getById(userId);
    // get request
    const request = Request.getById(requestId);


    // cancel rental
    //delete request
  }


}

module.exports = new UserService();
