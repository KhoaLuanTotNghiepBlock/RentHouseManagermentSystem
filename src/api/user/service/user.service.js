require('dotenv').config();
// const multer = require("multer");
const User = require("../../../model/user/user.model");
// const awss3helper = require('../../../utils/awss3.helper');
const userValidate = require("../validate/user.validation");
const awsS3ServiceHelper = require("../../../utils/aws-s3-service.helper");
const MyError = require("../../../exception/MyError");
const City = require('../../../model/city.model');
const addressService = require('./address.service');
const Ward = require('../../../model/ward.model');
const Contract = require('../../../model/transaction/contract.model');
const Notification = require('../../../model/user/notification.model');
const Request = require('../../../model/user/request.model');
const RentalContract = require('../blockchain/deploy/BHRentalContract');
const contractService = require('./contract.service');
const { compare } = require('../../../utils/object.helper');
const { ACTION_FUNCTION, USER_TRANSACTION_ACTION } = require('../../../config/user-transaction');
const { ACTION_TRANSFER, ADMIN } = require('../../../config/default');
const userWalletService = require('./user-wallet.service');
const { toObjectId } = require('../../../utils/common.helper');


class UserService {
  checkImage(file) {
    const { mimetype } = file;

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") { throw new MyError("Image invalid"); }
  }

  async cityData() {
    const listDitrict = await addressService.getDitrictsFromDatabase();
    const city = await City.findOne({ _id: "6415ee77cc372ede59b64c1a" })

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

  async cancelRentalByRenter(renterId, contractId) {

    const renter = await User.getById(renterId);

    const contract = await Contract.findOne({
      _id: contractId
    });

    if (!contract) throw new MyError('Contract not found');

    const notification = await Notification.create({
      user: renter._id,
      type: "CANCEL_CONTRACT",
      content: 'end rent room',
      tag: [renter._id, contract.lessor]
    });

    const request = await Request.create({
      from: renter._id,
      to: contract.lessor,
      type: 'CANCEL_RENTAL',
      data: contract
    });
    return {
      notification, request
    }
  }

  async extendContract(renterId, contractId) {

    const renter = await User.getById(renterId);

    const contract = await Contract.findOne({
      _id: contractId
    });

    if (!contract) throw new MyError('Contract not found');

    const notification = await Notification.create({
      user: renter._id,
      type: "NOTIFICATION",
      content: 'end rent room',
      tag: [renter._id, contract.lessor]
    });

    const request = await Request.create({
      from: renter._id,
      to: contract.lessor,
      type: 'CANCEL_RENTAL',
      data: contract
    });
    return {
      notification, request
    }
  }

  async acceptCancelRentalRoom(ownerId, requestId) {
    const request = await Request.findOne({
      _id: requestId
    })

    const { data } = request;

    if (!request) throw new MyError('request not found');
    //check contract due
    const dateEnd = new Date();
    // in due
    const inDue = await contractService.checkContractStatus(dateEnd, data._id);
    let result;

    if (!inDue) {
      result = await RentalContract.endRent(data?.lessor?.wallet.walletAddress, data.room, data?.renter?.wallet.walletAddress);
    }
    // const penaltyFee = (data.payment * 50) / 100;
    result = await RentalContract.endRentInDue(data?.lessor?.wallet.walletAddress, data.room, data?.renter?.wallet.walletAddress);

    return result;
  }

  async cancelContractByLessor(ownerId, contractId) {
    const contract = await Contract.findOne({
      _id: contractId,
      status: "available"
    }).populate([
      {
        path: "renter",
        select: "_id wallet"
      },
      {
        path: "lessor",
        select: "_id wallet"
      },
      {
        path: "room",
        select: "-updatedAt"
      }
    ]);
    if (!contract) throw new MyError('contract not found');

    const { renter, lessor, room, penaltyFeeEndRent } = contract;

    //check contract due
    const dateEnd = new Date();
    // in due
    const inDue = await contractService.checkContractStatus(dateEnd, contractId);

    const result = await RentalContract.endRent(lessor?.wallet.walletAddress, room.renter?.wallet.walletAddress);

    if (inDue) {
      const data = this.transferBalance(lessor._id, renter._id, penaltyFeeEndRent, ACTION_TRANSFER.TRANSFER);

      await userWalletService.changeBalance(
        renter._id,
        penaltyFeeEndRent,
        data,
        USER_TRANSACTION_ACTION.PAYMENT);

      const notification = Notification.create({
        userOwner: ADMIN._id,
        tag: [renter._id],
        content: `you receive penalty fee from room ${room.name} for end rent in due`
      });
    }
    return {
      result
    }
  }

  async transferBalance(fromUserId, toUserId, amount, action) {
    const from = await User.getById(fromUserId);
    const to = await User.getById(toUserId);

    if (amount < 0)
      throw new MyError('amount not invalid!');

    if (compare(from._id, to._id)) throw new MyError('can not transfer for self');
    const result = await RentalContract.transferBalance(from?.wallet?.walletAddress, to?.wallet?.walletAddress, amount, action);
    return result;
  }

  async withdrawMoney(userId, amount) {
    console.log("🚀 ~ file: user.service.js:242 ~ UserService ~ withdrawMoney ~ userId, amount:", userId, amount)
    if (!userId || amount < 0)
      throw new MyError('missing parameter');

    const { _id, wallet } = await User.findOne({ _id: toObjectId(userId) });
    if (wallet?.balance < amount)
      throw new MyError('not enough balance!');

    await userWalletService.changeBalance(
      _id,
      amount,
      {},
      USER_TRANSACTION_ACTION.WITHDRAW,
    );

    const notification = await Notification.create({
      user: ADMIN._id,
      type: "NOTIFICATION",
      content: `you withdraw ${amount} success`,
      tag: [_id]
    });

    return { notification };
  }


}

module.exports = new UserService();
