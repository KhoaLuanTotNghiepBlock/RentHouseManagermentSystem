const ArgumentError = require("../../../exception/ArgumentError");
const Contract = require("../../../model/transaction/contract.model");
const serviceDemand = require('../service/demand.service');
class InvoiceService {
    async createInvoice(contractId, invoiceInfo) {
        if (!(contractId && invoiceInfo))
            throw new ArgumentError('invoice service ==>');

        const contract = await Contract.getById(contractId);

        const { room, period, payment, payMode, dateRent } = contract;

        const { services } = room;

        const listServiceDemand = [];

        for (val of services) {
            const serDemand = await 
        }
    }
};
module.exports = new InvoiceService();