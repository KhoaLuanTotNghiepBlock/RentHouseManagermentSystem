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

        let { period, room, dateRent, paytime, payMode, payment } = contractInfo;

        dateRent = dateUtil.toDate(dateRent);
        paytime = dateUtil.toDate(paytime);

        if (!commonValidate.validatePayMode(payMode))
            throw new MyError('validate contract ==> paymode invalid');


        period = commonUtil.convertToNumber(period);
        payment = commonUtil.convertToNumber(payment);

        const rentalRoom = await Room.getById(room);
        const { owner } = rentalRoom;
        console.log("🚀 ~ file: contract.validatation.js:32 ~ validateContractInfo: ~ owner", owner)

        if (!rentalRoom)
            throw new MyError('room info invalid!');

        return new Contract({
            period,
            lessor: owner._id,
            room,
            dateRent,
            payment,
            paytime,
            payMode,
            enable: true
        });
    },
};

module.exports = contractValidate;