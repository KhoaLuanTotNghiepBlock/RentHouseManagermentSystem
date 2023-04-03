const contractValidate = require('../validate/contract.validatation');
const Contract = require('../../../model/transaction/contract.model');
const User = require('../../../model/user/user.model');
const Request = require('../../../model/user/request.model');
const MyError = require('../../../exception/MyError');
const demandService = require('./demand.service');
const NotFoundError = require('../../../exception/NotFoundError');
const crypto = require('../../../utils/crypto.hepler');
const HashContract = require('../../../model/transaction/hash-contract.model');
const { toObjectId } = require('../../../utils/common.helper');
const ArgumentError = require('../../../exception/ArgumentError');
const RentalContract = require('../blockchain/deploy/BHRentalContract');
const datetimeHelper = require('../../../utils/datetime.helper');
const RoomTransaction = require('../../../model/transaction/room-transaction.model');
const roomService = require('./room.service');
const commonHelper = require('../../../utils/common.helper');
const Room = require('../../../model/room.model');
const Notification = require('../../../model/user/notification.model');
const { ADMIN } = require('../../../config/default');

class ContractService {

    async createContract(renterId, contractInfo) {
        // get owner 
        const renter = await User.getById(renterId);
        console.log("🚀 ~ file: contract.service.js:25 ~ ContractService ~ createContract ~ renter:", renter)

        // validate contract info 
        let contract = await contractValidate.validateContractInfo(contractInfo);

        if (!contract)
            throw new MyError('contract service => contract invalid!');

        // set renter 
        contract.renter = renter._id;
        const owner = await User.getById(contract.lessor);
        await contract.save();

        await demandService.createServiceDemandForRoom(contract._id);
        // create contract hash
        const contractHash = await this.hashContract(contract._id);

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [
                owner._id,
                renter._id
            ],
            content: 'create contract sucess'
        });
        return {
            contract, contractHash
        }
    }

    async getContractByRenter(renterId) {
        if (!renterId)
            throw new MyError('contract service ==> renter info invalid!');
        const contract = await Contract.getByRenterId(renterId);
        return {
            contract
        }
    }

    async getAllContract(
        conditions = {},
        pagination) {

        const filter = { ...conditions };
        const { limit, page, skip } = pagination;
        delete filter.limit;
        delete filter.page;

        const [items, total] = await Promise.all([
            await Contract.find(conditions)
                .populate([
                    {
                        path: 'renter',
                        select: '_id username name phone email avatar'
                    },
                    {
                        path: 'lessor',
                        select: '_id username name phone email avatar'
                    },
                    {
                        path: 'room',
                        select: "-updatedAt -lstTransaction"
                    }])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Contract.countDocuments(filter),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async signByRenter(userId, roomId, contractHash) {
        if (!userId || !contractHash || !roomId)
            throw new ArgumentError('sign by renter missing');

        const contract = await HashContract.getByHash(contractHash);
        const { contractId } = contract;
        const value = contractId.room.deposit + contractId.payment;
        //  check payment
        const { wallet } = await User.getById(userId);
        if (value > wallet.balance)
            throw new MyError('Insufficient balance');


        return await RentalContract.signByRenter(
            wallet?.walletAddress,
            contractHash,
            contractId.room.roomUid,
            contractId.payment,
            contract.contractId.room?.deposit
        );
    }

    async cancelContractByRenter(renterId, contractId) {
        console.log("🚀 ~ file: contract.service.js:128 ~ ContractService ~ cancelContractByRenter ~ contractId:", contractId)
        /**
         * get user renter
         * get contract
         * send request to owner
         * check period of contract 
         *      => period => renter pay penalty fee, lost deposit fee
         *      => !period => renter receive deposit
         */
        const renter = await User.getById(renterId);
        const contract = await Contract.getOne(contractId);
        if (contract.lessor._id === renter._id)
            throw new MyError('You not renter');

        let request = await Request.findOne({
            type: 'CANCEL_RENTAL',
            from: renter._id,
            to: contract.lessor._id
        });

        if (!request) {
            request = await Request.create({
                type: 'CANCEL_RENTAL',
                data: contract,
                from: renter._id,
                to: contract.lessor._id
            });
        }

        const notification = await Notification.create({
            userOwner: renter._id,
            type: 'CANCEL_REQUEST',
            content: 'end rent room',
            tag: [renter._id, contract.lessor._id]
        });

        return {
            request,
            notification
        };
    }
    //takes a parameter days that specifies the number of days in the future to look for contracts where payTime is due
    async getContractsDueIn(days) {
        const today = new Date();
        const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

        // Find contracts where payTime is within the specified range
        const contracts = await Contract.find({});
        return contracts;
    }

    async checkContractStatus(date, contractId) {
        const contract = await Contract.getOne(contractId);
        const { dateRent, period } = contract;

        const periodDate = datetimeHelper.periodDate(dateRent, period);
        if (!periodDate)
            throw new MyError('period date invalid!');
        return periodDate > date;
    }

    async hashContract(contractId) {
        const contract = await Contract.getOne(contractId);

        if (!contract)
            throw new NotFoundError('Contract not found!');

        const jsonContract = JSON.stringify(contract);

        const hash = crypto.hash(jsonContract);

        const contractHash = await HashContract.create({
            contractId,
            hash,
        });
        return hash;
    }

    async getContractByHash(hashContract) {
        const { contractId, hash } = await HashContract.getByHash(hash);

        const contract = await Contract.getOne(contractId);
        if (!contract)
            throw new NotFoundError('Contract not found!');

        const jsonContract = JSON.stringify(contract);

        if (!crypto.match(hashContract, jsonContract))
            throw new MyError('Contract does not match');

        return contract;
    }

    async getAllRoomByRented(
        conditions = {},
        pagination,
        projection,
        sort = {}) {

        const filter = { ...conditions };
        const { limit, page, skip } = pagination;
        delete filter.limit;
        delete filter.page;
        const { renter } = filter;
        renter && (filter.renter = toObjectId(renter));


        let [items, total] = await Promise.all([
            Contract.find(conditions, projection)
                .populate([
                    {
                        path: 'room',
                        select: "-updatedAt"
                    },
                    {
                        path: 'renter',
                        select: "-updatedAt"
                    },
                    {
                        path: 'lessor',
                        select: "-updatedAt"
                    }
                ]).sort(sort).skip(skip).limit(limit),
            Contract.aggregate([
                { $match: { renter: filter.renter } },
                { $count: "totalValue" },
            ]),
        ]);

        total = total.length !== 0 ? total[0].totalValue : 0;
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAllRoomLessor(
        conditions = {},
        pagination,
        projection,
        sort = {}) {

        const filter = { ...conditions };
        const { limit, page, skip } = pagination;
        delete filter.limit;
        delete filter.page;
        const { lessor } = filter;
        lessor && (filter.lessor = toObjectId(lessor));


        //     from: "users",
        //     let: { userId: "$lessor" },
        //     pipeline: [
        //         {
        //             $match: { $expr: { $eq: ["$_id", "$$userId"] } },
        //         },
        //         {
        //             $project: {
        //                 _id: 1,
        //                 name: 1,
        //                 avatar: 1,
        //                 phone: 1,
        //                 email: 1,
        //                 identity: 1,
        //                 wallet: 1
        //             },
        //         },
        //     ],
        //     as: "lessor",
        // };
        // Contract.aggregate([
        //     { $match: { lessor: filter.lessor } },
        //     { $lookup: renterLookup },
        //     { $unwind: "$renter" },
        //     { $lookup: roomLookup },
        //     { $unwind: "$room" },
        //     // { $lookup: lessorLookup },
        //     // { $unwind: "$lessor" },
        //     { $limit: limit },
        //     { $skip: skip },
        //     { $sort: sort },
        //     { $project: projection },
        // ]),
        let [items, total] = await Promise.all([
            Contract.find(conditions, projection)
                .populate([
                    {
                        path: 'room',
                        select: "-updatedAt"
                    },
                    {
                        path: 'renter',
                        select: "-updatedAt"
                    },
                    {
                        path: 'lessor',
                        select: "-updatedAt"
                    }
                ]).sort(sort).skip(skip).limit(limit),
            Contract.aggregate([
                { $match: { lessor: filter.lessor } },
                { $count: "totalValue" },
            ]),
        ]);

        total = total.length !== 0 ? total[0].totalValue : 0;
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};

module.exports = new ContractService();