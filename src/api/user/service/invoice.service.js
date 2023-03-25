const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const Contract = require("../../../model/transaction/contract.model");
const datetimeHelper = require("../../../utils/datetime.helper");
const serviceDemand = require('../service/demand.service');
const InvoiceValidate = require("../validate/invoice.validate");
const Invoice = require('../../../model/transaction/invoice.model');
const commonHelper = require('../../../utils/common.helper');
const contractService = require("./contract.service");

class InvoiceService {

    async createInvoice(userId, contractId, invoiceInfo) {
        if (!(contractId && invoiceInfo && userId))
            throw new ArgumentError('invoice service ==>');

        const contract = await Contract.getOne(contractId);

        const { period, payMode, dateRent, lessor } = contract;

        // if (userId !== lessor._id)
        //     throw new MyError('Unauthorize to create invoices');

        let { paymentDay } = this.checkDueInvoiceDay(dateRent, new Date(), period);
        let endDate = new Date(paymentDay);
        endDate.setDate(endDate.getDate() + 10);

        const serviceDemands = invoiceInfo.listServiceDemands;
        if (!serviceDemands || !serviceDemands.length) {
            throw new MyError('invoice service ==> listServiceDemand ');
        }

        // use reduce to calculate sum of service demand 
        const amount = serviceDemands.reduce((sum, demand) => sum + demand.amount, 0);
        const serviceDemandIds = serviceDemands.map(demand => demand._id);

        let invoice = new Invoice({
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
            data: invoice
        }

    }

    checkDueInvoiceDay(dateRent, paymentDay, period) {
        if (!(dateRent && paymentDay))
            throw new ArgumentError('invoice service ==> date rent, payment day ');

        if (InvoiceValidate.checkDateRentExpired(dateRent, paymentDay, period))
            throw new MyError('Period of contract has expired!');

        return paymentDay = datetimeHelper.toObject(paymentDay);
    }

    async payForRentEachMonth(renterId, invoiceId) {
        // get renter info
        // get invoice info
        const { contract, amount, startDate, endDate } = await Invoice.getOne({ _id: invoiceId });
        if (!contract)
            throw new MyError('invoice not found');
        //check date to pay
        // check balance

        // payfor invoice
        // uodate status of invoice

    }
};
module.exports = new InvoiceService();