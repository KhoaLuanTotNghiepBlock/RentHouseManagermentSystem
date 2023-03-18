require("dotenv").config();
const jwt = require("jsonwebtoken");
// const axios = require("axios");
const User = require("../../../model/user/user.model");
const Token = require("../../../model/user/token.model");
const mailHelper = require("../../../utils/nodemailer.helper");
const crypto = require("../../../utils/crypto.hepler");
const web3 = require('../blockchain/config/web3-init');
const commonHelper = require("../../../utils/common.helper");
const userValidation = require("../validate/user.validation");

const { SECRET_KEY } = process.env;
const { REFRESH_SECRET_KEY } = process.env;
const { REQUEST_VERIFY_TOKEN_LIFE } = process.env;
// const { REQUEST_RESET_TOKEN_LIFE } = process.env;
const TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE;
const { REFRESH_TOKEN_LIFE } = process.env;
const { OTP_EXPIRE_MINUTE } = process.env;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

const sendMessage = require("../../../config/sendsms");
const { isEmpty } = require("../../../utils/common.helper");

class AuthService {

  async registry(userInfo) {
    if (!userInfo) {
      return {
        message: "Registry value underfine",
        errorCode: 400,
        data: {},
      };
    }

    try {
      const {
        username, password, contactInfo, identity, error, email
      } = await userValidation.checkRegistryInfo(userInfo);
      if (!isEmpty(error)) {
        return {
          data: {},
          message: error,
          errorCode: 400,
        };
      }
      const typeContact = userValidation.validatePhone(contactInfo);

      let newUser = new User({
        username,
        identity,
        avatar: "",
        auth: {
          password: crypto.hash(password),
          remainingTime: Date.now(),
        },
        phone: "",
        email
      });

      newUser.phone = contactInfo;

      // create wallet
      const { address, privateKey } = await this.createWallet();
      newUser.wallet =
      {
        walletAddress: address,
        walletPrivateKey: privateKey
      }
      await newUser.save();

      this.sendOTP(newUser._id, contactInfo);

      return {
        data: {},
        message: "Account is create succesful",
        errorCode: 200,
      };
    } catch (error) {
      return {
        data: {},
        message: error.message,
        errorCode: 400,
      };
    }
  }

  async login(userInfo) {
    try {
      const { username, password } = userInfo;
      if (!(userValidation.validateEmail(username) || userValidation.validateUsername(username) || userValidation.validatePhone(username))) { throw new Error("Info Login invalid"); }
      // get user
      const user = await User.findOne({
        $or: [{ username }, { email: username }, { phone: username }],
      })
        .select("username name email phone auth avatar wallet wishList")
        .lean();

      if (!user) throw new Error("user not found!");

      // check password
      if (!crypto.match(user.auth.password, password)) { throw new Error("password is wrong"); }

      const { phone, email } = user;
      // check account is already verify yet
      if (!user.auth.isVerified) {
        this.sendOTP(user._id, phone);

        return {
          status: true,
          message: "Already send otp!",
          data: {
            username, phone, email
          },
          errorCode: 200,
        };
      }

      // check account is already verify yet
      if (!user.auth.isAuthorize) {
        return {
          status: true,
          message: "You must update your identity!",
          data: {},
          errorCode: 400,
        };
      }

      const payload = {
        userId: user._id,
        isAdmin: user.auth.isAdmin,
      };

      const accessToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: TOKEN_LIFE,
      });

      const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
        expiresIn: REFRESH_TOKEN_LIFE,
      });

      await Token.create([
        {
          refreshToken,
          payload,
        },
      ]);

      if (user.auth.isAdmin) user.isAdmin = true;

      user.auth = undefined;

      return {
        status: true,
        message: "login success",
        errorCode: 200,
        data: {
          accessToken,
          refreshToken,
          user,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: 400,
        data: {},
      };
    }
  }

  async sendOTP(userId, username) {
    let type = true;

    if (!userValidation.validatePhone(username)) type = false;

    // random otp
    const otp = commonHelper.getRandomOTP();
    const otpTime = new Date();

    // set time to otp
    otpTime.setMinutes(otpTime.getMinutes() + OTP_EXPIRE_MINUTE);

    // find user
    const user = User.findOne({ _id: userId });

    if (!user) { throw new Error("send_otp ==> user not found!"); }

    await User.updateOne({ _id: userId }, { otp, otpTime });

    // type = false -> email
    if (!type) {
      // create token verify by email with userID and mail
      const token = jwt.sign(
        { userId, username },
        SECRET_KEY,
        {
          expiresIn: REQUEST_VERIFY_TOKEN_LIFE,
          subject: "verify-email",
        },
      );

      mailHelper.sendVerify({
        to: username,
        username: user.username,
        token,
      });
    } else {
      const data = JSON.stringify({
        messages: [
          {
            destinations: [
              {
                to: username,
              },
            ],
            from: "BUGHOUSE",
            text: `BUGHOUSE - Mã OTP xác nhận của bạn: ${otp} (thoi han ${OTP_EXPIRE_MINUTE} phut)`,
          },
        ],
      });

      sendMessage(data);
    }
  }

  checkOTP(sendOTP, dbOTP, otpTime) {
    if (!dbOTP) throw new Error("check_otp ==> OTP invalid");

    // nếu otp sai
    if (sendOTP !== dbOTP) throw new Error("check_otp ==> OTP invalid");
  }

  async resetOTP(username) {
    try {
      if (!userValidation.validateUsername(username)) { throw new Error("reset otp ==> username invalid"); }

      // find user
      const user = await User.findOne({ username });
      if (!user) throw new Error("reset otp ==> user not found");

      // get userId, phone
      const { phone } = user;

      // send otp
      this.sendOTP(user._id, phone);

      // return status
      return {
        errorCode: 200,
        message: "OTP already send!",
        data: {},
      };
    } catch (error) {
      return {
        errorCode: 400,
        message: error.message,
        data: {},
      };
    }
  }

  async confirmAccount(username, otpPhone) {
    // check acccount
    try {
      await userValidation.validateConfirmAccount(username, otpPhone);

      // find account
      const user = await User.findOne({
        username,
      });

      if (!user) throw new Error("confirm_account ==> not found User");

      if (!user || user.auth.isVerified) { throw new Error("confirm_account ==>  Account is already confirm"); } else {
        const { otp, otpTime } = user;

        // check otp
        this.checkOTP(otpPhone, otp, otpTime);

        user.auth.isVerified = true;
        user.auth.remainingTime = undefined;

        await user.save();
      }
      return {
        errorCode: 200,
        message: "Account confirm successful",
        data: {},
      };
    } catch (error) {
      return {
        errorCode: 400,
        message: error.message,
        data: {},
      };
    }
  }

  async verifyEmail(token) {
    // check token
    // decode token get email + userId
    await jwt.verify(
      token,
      SECRET_KEY,
      {
        subject: "verify-email",
      },

      async (error, decode) => {
        if (error) throw new Error(`verify email ==> ${error}`);
        else {
          // find user by token
          const user = await User.findOne({ _id: decode.userId });
          if (!user) throw new Error("verify email ==> User not found!");

          // check account is already verify yet
          if (user.auth.isVerified) {
            throw new Error("Account is already verify!");
          } else {
            user.auth.isVerified = true;
            user.auth.remainingTime = undefined;
            user.email = decode.email;
            await user.save();
          }
        }
      },
    );
  }

  async createWallet() {
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.create();
    const address = signer.address;
    const privateKey = signer.privateKey;
    await web3.eth.accounts.wallet.add(signer);

    return {
      address,
      privateKey
    }
  }

  async updateProfileByIndentity(userId, userInfo) {
    if (!userInfo)
      throw new ArgumentError('update profile => missing');

    const { name, dob, sex, id, identityImg, home, address_entities } = userInfo;
    let user = await User.findOne({ _id: userId });
    user.name = name;
    user.gender = sex === 'N/A' ? 'Other' : sex;
    user.dob = dob;
    user.identity = id;
    user.identityImg = identityImg?.length !== 0 ? identityImg : [];
    user.address = {};
    user.address.city = address_entities?.province?.toLowerCase() || '';
    user.address.district = address_entities?.district?.toLowerCase() || '';
    user.address.ward = address_entities?.ward?.toLowerCase() || '';
    user.address.street = address_entities?.street?.toLowerCase() || '';
    user.auth.isAuthorize = true;
    await user.save();
    return { user };
  }

}
module.exports = new AuthService();
