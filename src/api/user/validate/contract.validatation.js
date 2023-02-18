const ArgumentError = require('../../../exception/ArgumentError');
const commonValidate = require('./common.validate');
const dateUtil = require('../../../utils/datetime.helper');
const commonUtil = require('../../../utils/common.helper');
const MyError = require('../../../exception/MyError');
const User = require('../../../model/user/user.model');
const Apartment = require('../../../model/apartment.model');
const Room = require('../../../model/room.model');
const Contract = require('../../../model/transaction/contract.model');

const contractValidate = {

    validateContractInfo: async (contractInfo) => {
        if (!contractInfo)
            throw new ArgumentError('valid contract ==>');

        let { period, lessor, rentHouse, dateRent, paytime, payMode, payment } = contractInfo;

        dateRent = dateUtil.toDate(dateRent);
        paytime = dateUtil.toDate(paytime);

        if (!commonValidate.validatePayMode(payMode))
            throw new MyError('validate contract ==> paymode invalid');

        if (!await User.getById(lessor))
            throw new MyError('validate contract ==> user lessor invalid');

        period = commonUtil.convertToNumber(period);
        payment = commonUtil.convertToNumber(payment);

        if (!await Apartment.findById(rentHouse._id) && !await Room.findById(rentHouse._id))
            throw new MyError('contract validate => rent house invalid!');

        return new Contract({
            period,
            lessor,
            rentHouse,
            dateRent,
            payment,
            paytime,
            payMode,
            enable: true
        });
    },
};

module.exports = contractValidate;