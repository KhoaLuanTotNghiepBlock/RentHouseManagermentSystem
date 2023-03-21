const contractValidate = require('../validate/contract.validatation');
const Contract = require('../../../model/transaction/contract.model');
const User = require('../../../model/user/user.model');
const MyError = require('../../../exception/MyError');
const demandService = require('./demand.service');
const NotFoundError = require('../../../exception/NotFoundError');
const crypto = require('../../../utils/crypto.hepler');
const HashContract = require('../../../model/transaction/hash-contract.model');
const { toObjectId } = require('../../../utils/common.helper');
const ArgumentError = require('../../../exception/ArgumentError');
const RentalContract = require('../blockchain/deploy/BHRentalContract');
const datetimeHelper = require('../../../utils/datetime.helper');

class ContractService {

    async createContract(ownerId, contractInfo) {
        // get owner 
        const owner = await User.getById(ownerId);

        // validate contract info 
        let contract = await contractValidate.validateContractInfo(contractInfo);

        if (!contract)
            throw new MyError('contract service => contract invalid!');

        // set renter 
        contract.lessor = owner._id;

        await contract.save();

        await demandService.createServiceDemandForRoom(contract._id);
        return {
            data: contract
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

    async creatSmartContract(contractId, ownerAddress, renterAddress) {
        if (!(contractId && ownerAddress && renterAddress))
            throw new ArgumentError('smart contract');

        const contract = await Contract.getOne(contractId);

        const { room, payment } = contract;
        // then hash all info of contract
        const hash = await this.hashContract(contractId);
        if (!hash)
            throw new MyError('Contract info invalid!');

        return await RentalContract.createSmartContractFromRentalContract(
            { contractId, rentAumont: payment, depositAmount: room?.deposit, hash },
            ownerAddress, renterAddress
        )
    }

    async signByRenter(userId, contractAddress) {
        if (!userId || !contractAddress)
            throw new ArgumentError('sign by renter missing');

        const user = await User.getById(userId);
        const { wallet } = user;
        const contract = await HashContract.getByAddress(contractAddress);
        if (contract.payment > wallet.balance)
            throw new MyError('Insufficient balance');
        return await RentalContract.signByRenter(wallet?.walletAddress, contractAddress, contract.payment);
    }

    async signByOwner(userId, contractAddress) {
        if (!userId || !contractAddress)
            throw new ArgumentError('sign by owner missing');

        const user = await User.getById(userId);
        const { wallet } = user;

        return await RentalContract.signByOwner(wallet.walletAddress, contractAddress);
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

        return crypto.hash(jsonContract);
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

        const roomLookup = {
            from: "rooms",
            let: { room: "$room" },
            pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$room"] } } },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$owner" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    avatar: 1,
                                    phone: 1,
                                    email: 1,
                                    identity: 1,
                                },
                            },
                        ],
                        as: "owner",
                    },
                    $lookup: {
                        from: "services",
                        let: { serviceIds: "$services" },
                        pipeline: [
                            { $match: { $expr: { $in: ["$_id", "$$serviceIds"] } } },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    avatar: 1,
                                    phone: 1,
                                    email: 1,
                                    identity: 1,
                                },
                            },
                        ],
                        as: "services",
                    }
                },
                { $project: { updatedAt: 0 } },
            ],
            as: "room",
        };

        const renterLookup = {
            from: "users",
            let: { userId: "$renter" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        phone: 1,
                        email: 1,
                        identity: 1,
                    },
                },
            ],
            as: "renter",
        };

        const lessorLookup = {
            from: "users",
            let: { userId: "$lessor" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        phone: 1,
                        email: 1,
                        identity: 1,
                    },
                },
            ],
            as: "lessor",
        };
        let [items, total] = await Promise.all([
            Contract.aggregate([
                { $match: { renter: filter.renter } },
                { $lookup: roomLookup },
                { $unwind: "$room" },
                { $lookup: renterLookup },
                { $unwind: "$renter" },
                { $lookup: lessorLookup },
                { $unwind: "$lessor" },
                { $limit: limit },
                { $skip: skip },
                { $sort: sort },
                { $project: projection },
            ]),
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

        const roomLookup = {
            from: "rooms",
            let: { room: "$room" },
            pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$room"] } } },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$owner" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    avatar: 1,
                                    phone: 1,
                                    email: 1,
                                    identity: 1,
                                },
                            },
                        ],
                        as: "owner",
                    },
                    $lookup: {
                        from: "services",
                        let: { serviceIds: "$services" },
                        pipeline: [
                            { $match: { $expr: { $in: ["$_id", "$$serviceIds"] } } },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    avatar: 1,
                                    phone: 1,
                                    email: 1,
                                    identity: 1,
                                },
                            },
                        ],
                        as: "services",
                    }
                },
                { $project: { updatedAt: 0 } },
            ],
            as: "room",
        };

        const renterLookup = {
            from: "users",
            let: { userId: "$renter" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        phone: 1,
                        email: 1,
                        identity: 1,
                    },
                },
            ],
            as: "renter",
        };

        const lessorLookup = {
            from: "users",
            let: { userId: "$lessor" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        phone: 1,
                        email: 1,
                        identity: 1,
                    },
                },
            ],
            as: "lessor",
        };
        let [items, total] = await Promise.all([
            Contract.aggregate([
                { $match: { lessor: filter.lessor } },
                { $lookup: roomLookup },
                { $unwind: "$room" },
                { $lookup: renterLookup },
                { $unwind: "$renter" },
                { $lookup: lessorLookup },
                { $unwind: "$lessor" },
                { $limit: limit },
                { $skip: skip },
                { $sort: sort },
                { $project: projection },
            ]),
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
};

module.exports = new ContractService();