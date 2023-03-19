const ArgumentError = require('../../../exception/ArgumentError');
const commonValidate = require('./common.validate');
const dateUtil = require('../../../utils/datetime.helper');
const commonUtil = require('../../../utils/common.helper');
const MyError = require('../../../exception/MyError');
const User = require('../../../model/user/user.model');
const Room = require('../../../model/room.model');
const Contract = require('../../../model/transaction/contract.model');

const contractValidate = {

    validateContractInfo: async (contractInfo) => {
        if (!contractInfo)
            throw new ArgumentError('valid contract ==>');

        let { period, room, dateRent, payTime, payMode, payment, renter } = contractInfo;

        dateRent = dateUtil.toDate(dateRent);
        if (!dateRent)
            throw new MyError('validate contract => date for rent invalid');

        payTime = dateUtil.toDate(payTime);

        if (!payTime)
            throw new MyError('validate contract => date for pay invalid');

        if (!commonValidate.validatePayMode(payMode))
            throw new MyError('validate contract ==> paymode invalid');

        const userRent = await User.getById(renter);

        period = commonUtil.convertToNumber(period);
        payment = commonUtil.convertToNumber(payment);

        return new Contract({
            period,
            renter: userRent._id,
            room,
            dateRent,
            payment,
            payTime,
            payMode,
            enable: true
        });
    },
};

module.exports = contractValidate;