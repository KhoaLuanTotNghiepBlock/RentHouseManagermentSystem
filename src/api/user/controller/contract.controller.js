const MyError = require('../../../exception/MyError');
const contractService = require('../service/contract.service');

class ContractController {

    //[POST] bh/contract/create-contract
    async createContract(req, res, next) {
        try {
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

    // [GET] bh/contract/:renterId 
    async getContractByRenter(req, res, next) {
        try {
            const { data } = await contractService.getContractByRenter(req.params.renterId);
        } catch (error) {
            next(error);
        }
    }


};

module.exports = new ContractController();