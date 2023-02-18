const contractValidate = require('../validate/contract.validatation');
const Contract = require('../../../model/transaction/contract.model');
const User = require('../../../model/user/user.model');
const MyError = require('../../../exception/MyError');

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
        return {
            data: contract
        }
    }
};

module.exports = new ContractService();