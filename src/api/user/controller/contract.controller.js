const MyError = require('../../../exception/MyError');
const contractService = require('../service/contract.service');

class ContractController {

    //[POST] bh/contract/create-contract
    async createContract(req, res, next) {
        try {
            const { userId } = req.auth;

            const { data } = await contractService.createContract(userId, rea.body);

            if (!data)
                throw new MyError('create contract fail!');

            return res.status(200).json({
                message: 'create contract success',
                errorCode: 200,
                data
            });
        } catch (error) {

        }
    }
};

module.exports = new ContractController();