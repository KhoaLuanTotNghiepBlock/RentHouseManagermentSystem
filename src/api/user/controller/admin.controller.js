const bhRentalContract = require('../blockchain/deploy/BHRentalContract');
class AdminController {
    async deployRentalContract(req, res, next) {
        try {
            const { userId } = req.auth;

            const data = await bhRentalContract.initSmartContract(userId);
            return res.status(200).json({
                message: 'deploy success'
            });
        } catch (error) {

        }
    }
};
module.exports = new AdminController();