const router = require('express').Router();
const InvoiceController = require('../controller/invoice.controller');

router.post('/create', InvoiceController.createInvoice);

module.exports = router;