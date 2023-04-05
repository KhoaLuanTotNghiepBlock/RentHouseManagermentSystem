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
const Room = require("../../../model/room.model");
const { toObjectId } = require('../../../utils/common.helper');
const Notification = require("../../../model/user/notification.model");
const Request = require("../../../model/user/request.model");
class InvoiceService {

    async createInvoice(userId, contractId, invoiceInfo) {
        if (!(contractId && invoiceInfo && userId))
            throw new ArgumentError('invoice service ==>');

        const contract = await Contract.getOne(contractId);

        const { period, payMode, dateRent, lessor, renter, payment } = contract;

        // if (userId !== lessor._id)
        //     throw new MyError('Unauthorize to create invoices');

        let paymentDay = this.checkDueInvoiceDay(dateRent, new Date(), period);
        let endDate = new Date(paymentDay.getTime() + 2 * 24 * 60 * 60 * 1000);;

        const serviceDemands = invoiceInfo.listServiceDemands;
        if (!serviceDemands || !serviceDemands.length) {
            throw new MyError('invoice service ==> listServiceDemand ');
        }

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
        let notification = {};
        let request = {};

        if (invoice) {
            notification = await Notification.create({
                userOwner: lessor._id,
                type: 'INVOICE_TO_PAY',
                content: 'You have a invoice ready to pay',
                tag: [lessor._id, renter._id]
            });
        }
        return {
            invoice,
            notification,
        }

    }

    async getAll(
        conditions = {},
        pagination,
        projection = {}, forRent = false, forOwner = false) {
        let { payStatus, userId } = conditions;
        const { limit, page, skip } = pagination;
        const filter = {
            ...(payStatus && { payStatus }),
            ...((userId && forRent) && { "contract.renter": userId }),
            ...((userId && forOwner) && { "contract.lessor": userId }),
        };
        const [items, total] = await Promise.all([
            Invoice.find(filter, projection).populate([
                {
                    path: 'contract',
                    select: '-updatedAt',
                    populate: [
                        {
                            path: 'room',
                            select: '-updatedAt',
                        },
                        {
                            path: 'renter',
                            select: '_id username name avatar phone email',
                        },
                        {
                            path: 'renter',
                            select: '_id username name avatar phone email'
                        }
                    ]

                }
            ])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Invoice.countDocuments(filter),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getOne(conditions) {
        let { payStatus, invoiceId } = conditions;
        const filter = {
            ...(invoiceId && { _id: invoiceId }),
            ...(payStatus && { payStatus }),
        };

        const invoice = await Invoice.findOne(filter, projection).populate([
            {
                path: 'contract',
                select: '-updatedAt',
                populate: [
                    {
                        path: 'room',
                        select: '-updatedAt',
                    },
                    {
                        path: 'renter',
                        select: '_id username name avatar phone email',
                    },
                    {
                        path: 'renter',
                        select: '_id username name avatar phone email'
                    }
                ]

            }
        ]);

        if (!invoice) throw new MyError('invoice not found!')
        return invoice;
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

        const room = await Room.findOne({
            _id: invoice.contract.room,
            status: "already-rent"
        });
        console.log("🚀 ~ file: invoice.service.js:172 ~ InvoiceService ~ payForRentEachMonth ~ room:", room)

        if (!room) throw new MyError('room not found');
        // check date to pay
        const datePay = new Date();
        let penaltyFee = 0;
        if (datePay > invoice.endDate)
            penaltyFee = invoice.amount * 0.05;

        const rentAmount = room.basePrice;
        const invoiceFee = invoice.amount - rentAmount + penaltyFee;

        const data = await RentalContract.payForRentMonth(
            renter.wallet.walletAddress,
            room.roomUid,
            invoice,
            invoiceFee,
            rentAmount
        );

        return data;
    }
};
module.exports = new InvoiceService();