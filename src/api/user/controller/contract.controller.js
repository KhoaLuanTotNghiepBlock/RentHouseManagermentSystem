const MyError = require('../../../exception/MyError');
const User = require('../../../model/user/user.model');
const RentalContract = require('../blockchain/deploy/BHRentalContract');
const contractService = require('../service/contract.service');

class ContractController {

    //[POST] bh/contract/create-contract
    async createContract(req, res, next) {
        try {
            // owner id
            const { userId } = req.auth;

            const data = await contractService.createContract(userId, req.body);

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
        /**
         * renter aggree contract rule
         * create contract
         * ==> create smart contract
         */
        try {
            const { contractId, ownerAddress, renterAddress } = req.body;
            const data = await contractService.creatSmartContract(contractId, ownerAddress, renterAddress);

            return res.status(200).json({
                message: 'create smart contract success',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }

    }
    //[POST] bh/contract/:contractAddress/sign-by-renter
    async signByRenter(req, res, next) {
        try {
            const contractAddress = req.params.contractAddress;
            const { userId } = req.auth;
            const data = await contractService.signByRenter(userId, contractAddress);

            return res.status(200).json({
                message: 'sign smart contract success',
                errorCode: 200,
                data
            });
        } catch (error) {
            next(error);
        }
    }
    //[POST] bh/contract/:contractAddress/sign-lessor
    async signByOwner(req, res, next) {
        try {
            const contractAddress = req.params.contractAddress;
            const { userId } = req.auth;
            const data = await contractService.signByOwner(userId, contractAddress);

            return res.status(200).json({
                message: 'sign smart contract success',
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