const User = require('../../../model/user.model');
const bcrypt = require('bcryptjs');
const { isEmpty } = require('../../../utils/common.helper');

const NAME_INVALID = 'Name invalid';
const USERNAME_INVALID = 'Username invalid';
const USERNAME_EXISTS_INVALID = 'Accoount already exist';
const PASSWORD_INVALID = 'Password invalid more than 8 letter';
const CONTACT_INVALID = 'Contact info invalid';
const CONTACT_EXIST_INVALID = 'Contact already exist';
const INDENTITY_INVALID = 'Identity invalid';
const DATE_INVALID = 'Date of birth invalid';
const GENDER_INVALID = 'Gender invalid';
const NAME_REGEX = /\w{1,50}/;

const userValidate = {
    validateEmail: (email) => {
        if (!email) return false;

        const regex =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    },
    validatePhone: (phone) => {
        if (!phone) return false;
        const regex = /(84|0[3|5|7|8|9])+([0-9]{9})\b/g;

        return regex.test(phone);
    },

    validateUsername: function (username) {
        if (!username)
            return false;
        return true;
    },
    // not empty, minimun 8
    validatePassword: (password) => {
        if (!password) return false;
        if (password.length < 8) return false;

        return true;
    },

    validateDateOfBirth: (date) => {
        if (!date) return false;

        const { day, month, year } = date;

        if (!day || !month || !year) return false;

        if (year < 1900) return false;

        // check date
        const dateTempt = new Date(`${year}-${month}-${day}`);
        if (dateTempt.toDateString() === 'Invalid Date') return false;

        // ages of user more than 18
        const fullyear = dateTempt.getFullYear();
        dateTempt.setFullYear(fullyear + 18);

        if (dateTempt > new Date()) return false;

        return true;
    },
    // must be int and have 6 digit
    validateOTP: (otp) => {
        if (!otp) return false;
        const regex = /^[0-9]{6}$/g;

        return regex.test(otp);
    },

    validateLogin: (username, password) => {
        if (!(this.validateEmail(username) || this.validateUsername(username) || this.validatePhone(username)))
            throw new Error('Info Login invalid');
    },

    // validate username and otp to corfirm account
    validateConfirmAccount: function (username, otpPhone) {
        if (!this.validateUsername(username) || !this.validateOTP(otpPhone))
            throw new Error('Info confirm account invalid');
    },

    validateResetPassword: function (username, otpPhone, password) {
        if (
            !this.validateUsername(username) ||
            !this.validateOTP(otpPhone) ||
            !this.validatePassword(password)
        )
            throw new Error('Info reset password invalid');
    },

    validatePhonesList: function (phones) {
        if (!phones || !Array.isArray(phones))
            throw new Error('Phones invalid');

        phones.forEach((phoneEle) => {
            const { phone, name } = phoneEle;
            if (!name || !phone || !this.validatePhone(phone))
                throw new Error('Phones invalid');
        });
    },

    checkRegistryInfo: async function (userInfo) {
        let { name, username, password, contactInfo, identity } = userInfo;
        const error = {};

        // check vaalidate name
        if (!name || !NAME_REGEX.test(name)) error.name = NAME_INVALID;

        // check validate username
        if (!this.validateUsername(username)) error.username = USERNAME_INVALID;
        else if (await User.findOne({ username }))
            error.username = USERNAME_EXISTS_INVALID;

        // check contact info email or phone
        if (!contactInfo || !(this.validateEmail(contactInfo) || this.validatePhone(contactInfo))) error.contact = CONTACT_INVALID;

        // else if (await User.findOne({
        //     $or: [{ email: contactInfo }, { phone: contactInfo }]
        // }))
        //     error.contact = CONTACT_EXIST_INVALID;
        // $or: [{ email: contactInfo }, { phone: contactInfo }]
        // check validate password
        if (!this.validatePassword(password)) error.password = PASSWORD_INVALID;

        if (!identity) error.INDENTITY_INVALID;

        if (!isEmpty(error)) error.toString();

        return { name, username, password, contactInfo, identity, error };
    },
};

module.exports = userValidate;
