const invoiceService = require('../service/invoice.service');

class InvoiceController {
    // [POST] /invoice/create
    async createInvoice(req, res, next) {
        try {
            /**
             * from user lessor create invoice by contract
             */
            const { userId } = req.auth;

            const { contractId, invoiceInfo } = req.body;
            const { data } = await invoiceService.createInvoice(userId, contractId, invoiceInfo);

            return res.status(200).json({
                message: 'create success',
                data,
                errorCode: 200
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = new InvoiceController();