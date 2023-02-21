const contractValidate = require('../validate/contract.validatation');
const Contract = require('../../../model/transaction/contract.model');
const User = require('../../../model/user/user.model');
const MyError = require('../../../exception/MyError');
const demandService = require('./demand.service');
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
};

module.exports = new ContractService();