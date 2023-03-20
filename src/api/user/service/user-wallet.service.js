const User = require("../../../model/user/user.model");
const { bugId } = require('../../../config/default.json');
const MyError = require("../../../exception/MyError");

class UserWalletService {
    async getBalance(userId) {
        const { wallet } = await User.getById(userId);

        return wallet.balance;
    }

    async changeBalance(userId, amount, data, action, transactionId, withHistory = true) {
        const userBalance = await this.getBalance(userId);

        if (!amount)
            throw new MyError('Invalid balance');

    }
};

module.exports = new UserWalletService();
