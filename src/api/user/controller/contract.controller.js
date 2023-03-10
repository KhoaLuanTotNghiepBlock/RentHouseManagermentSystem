const MyError = require('../../../exception/MyError');
const RentalContract = require('../blockchain/deploy/BHRentalContract');
const contractService = require('../service/contract.service');

class ContractController {

    //[POST] bh/contract/create-contract
    async createContract(req, res, next) {
        try {
            // owner id
            const { userId } = req.auth;

            const { data } = await contractService.createContract(userId, req.body);

            if (!data)
                throw new MyError('create contract fail!');

            return res.status(200).json({
                message: 'create contract success',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    //[POST] bh/contract/create-smart-contract
    async createSmartContract(req, res, next) {
        try {
            const { contractId, signedByOwner, signedByRenter } = req.body;
            const data = await RentalContract.createSmartContractFromRentalContract(contractId, signedByOwner, signedByRenter);

            return res.status(200).json({
                message: 'create smart contract success',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }

    }

    // [GET] bh/contract/:renterId 
    async getContractByRenter(req, res, next) {
        try {
            const { data } = await contractService.getContractByRenter(req.params.renterId);

            return res.status(200).json({
                message: '',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }
    }
    // [GET] bh/contract/:contractAddress
    async getSmartContract(req, res, next) {
        try {
            const data = await RentalContract.getSmartContract(req.params.contractAddress);

            return res.status(200).json({
                message: '',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }
    }

};

module.exports = new ContractController();