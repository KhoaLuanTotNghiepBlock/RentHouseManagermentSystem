const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const Contract = require("../../../model/transaction/contract.model");
const datetimeHelper = require("../../../utils/datetime.helper");
const serviceDemand = require('../service/demand.service');
const InvoiceValidate = require("../validate/invoice.validate");
const Invoice = require('../../../model/transaction/invoice.model');
const commonHelper = require('../../../utils/common.helper');
const contractService = require("./contract.service");
const User = require("../../../model/user/user.model");
const RentalContract = require("../blockchain/deploy/BHRentalContract");
const RoomTransaction = require("../../../model/transaction/room-transaction.model");

class InvoiceService {

    async createInvoice(userId, contractId, invoiceInfo) {
        if (!(contractId && invoiceInfo && userId))
            throw new ArgumentError('invoice service ==>');

        const contract = await Contract.getOne(contractId);

        const { period, payMode, dateRent, lessor, payment } = contract;

        // if (userId !== lessor._id)
        //     throw new MyError('Unauthorize to create invoices');

        let paymentDay = this.checkDueInvoiceDay(dateRent, new Date(), period);
        let endDate = new Date(paymentDay.getTime() + 2 * 24 * 60 * 60 * 1000);;

        const serviceDemands = invoiceInfo.listServiceDemands;
        if (!serviceDemands || !serviceDemands.length) {
            throw new MyError('invoice service ==> listServiceDemand ');
        }
        // let total = payment;
        // serviceDemands.forEach(demand => {
        //     console.log("🚀 ~ file: invoice.service.js:33 ~ InvoiceService ~ createInvoice ~ demand:", demand)
        //     total += demand.amount; // total amount for all demands
        // });
        // console.log("🚀 ~ file: invoice.service.js:33 ~ InvoiceService ~ createInvoice ~ total:", total)

        // use reduce to calculate sum of service demand 
        const amount = serviceDemands.reduce((sum, demand) => sum + demand.amount, payment);
        const serviceDemandIds = serviceDemands.map(demand => demand._id);

        let invoice = await Invoice.create({
            contract: contract._id,
            creationDate: paymentDay,
            payStatus: 'Pending',
            paymentMethod: payMode,
            startDate: paymentDay,
            endDate,
            enable: true,
            amount,
            serviceDemands: serviceDemandIds
        });

        return {
            invoice
        }

    }

    checkDueInvoiceDay(dateRent, paymentDay, period) {
        if (!(dateRent && paymentDay))
            throw new ArgumentError('invoice service ==> date rent, payment day ');

        if (InvoiceValidate.checkDateRentExpired(dateRent, paymentDay, period))
            throw new MyError('Period of contract has expired!');

        return paymentDay;
    }


    async payForRentEachMonth(renterId, invoiceId) {
        // get renter info
        const renter = await User.getById(renterId);
        // get invoice info { contract, amount, startDate, endDate }
        const invoice = await Invoice.getOne(invoiceId);
        console.log("🚀 ~ file: invoice.service.js:78 ~ InvoiceService ~ payForRentEachMonth ~ invoice:", invoice)


        const roomTransaction = await RoomTransaction.findOne({
            roomId: invoice.contract.room,
            status: "already-rent"
        });

        if (!roomTransaction) throw new MyError('room not found');
        //check date to pay
        const datePay = new Date();
        // let penatyFee = 0;
        // if (invoice.endDate < datePay) {
        //     penatyFee = "10000";
        // }


        const data = await RentalContract.payForRentMonth(
            renter.wallet.walletAddress,
            roomTransaction.roomUid,
            invoice,
            invoice.amount
        );

        return data;
    }
};
module.exports = new InvoiceService();