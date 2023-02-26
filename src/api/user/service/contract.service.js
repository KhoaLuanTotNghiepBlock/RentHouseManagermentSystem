const contractValidate = require('../validate/contract.validatation');
const Contract = require('../../../model/transaction/contract.model');
const User = require('../../../model/user/user.model');
const MyError = require('../../../exception/MyError');
const demandService = require('./demand.service');
const NotFoundError = require('../../../exception/NotFoundError');
const crypto = require('../../../utils/crypto.hepler');
const HashContract = require('../../../model/transaction/hash-contract.model');
class ContractService {

    async createContract(renterId, contractInfo) {
        // get renter 
        const renter = await User.getById(renterId);

        // validate contract info 
        let contract = await contractValidate.validateContractInfo(contractInfo);

        if (!contract)
            throw new MyError('contract service => contract invalid!');

        // set renter 
        contract.renter = renter._id;

        await contract.save();

        const listDemand = await demandService.createServiceDemandForRoom(contract._id);
        console.log("🚀 ~ file: contract.service.js:24 ~ ContractService ~ createContract ~ listDemand:", listDemand);
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

    //takes a parameter days that specifies the number of days in the future to look for contracts where payTime is due
    async getContractsDueIn(days) {
        const today = new Date();
        const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

        // Find contracts where payTime is within the specified range
        const contracts = await Contract.find({});

        return contracts;
    }

    async hashContract(contractId) {
        const contract = await Contract.getById(contractId);

        if (!contract)
            throw new NotFoundError('Contract not found!');

        const jsonContract = JSON.stringify(contract);

        return crypto.hash(jsonContract);
    }

    async getContractByHash(hashContract) {
        const { contractId, hash } = await HashContract.getByHash(hash);

        const contract = await Contract.getById(contractId);

        if (!contract)
            throw new NotFoundError('Contract not found!');

        const jsonContract = JSON.stringify(contract);

        if (!crypto.match(hashContract, jsonContract))
            throw new MyError('Contract does not match');

        return contract;
    }
};

module.exports = new ContractService();