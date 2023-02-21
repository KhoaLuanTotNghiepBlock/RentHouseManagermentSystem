const datetimeHelper = require("../../../utils/datetime.helper");

const InvoiceValidate = {
    // check date rent already expired yet: return true if date has exprired
    checkDateRentExpired: (dateRent, dateCheck, period) => {
        const a = new Date("2022-10-25");
        const expriredDate = datetimeHelper.toDate(dateRent);
        expriredDate.setDate(expriredDate.getMonth() + period);

        const rentalDate = datetimeHelper.toDate(dateCheck);
        if (rentalDate > expriredDate)
            return true;
        return false;
    },

    validateInvoiceInfo: async (invoiceInfo) => {

    }
};