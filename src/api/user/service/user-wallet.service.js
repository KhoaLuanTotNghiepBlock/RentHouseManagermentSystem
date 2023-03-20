const User = require("../../../model/user/user.model");
const { bugId } = require('../../../config/default.json');
const MyError = require("../../../exception/MyError");
const UserTransaction = require('../../../model/transaction/user-transaction');
const commonHelper = require("../../../utils/common.helper");
const { USER_TRANSACTION_ACTION } = require('../../../config/user-transaction')

class UserWalletService {
    async getBalance(userId) {
        const { wallet } = await User.getById(userId);

        return wallet.balance;
    }

    async changeBalance(userId, amount, data, action, transactionId = bugId, withHistory = true) {

        const userBalance = await User.findOne({ _id: userId }).select('wallet');
        console.log("🚀 ~ file: user-wallet.service.js:18 ~ UserWalletService ~ changeBalance ~ userBalance:", userBalance)
        if (!userBalance)
            throw new MyError('user not found');

        amount = commonHelper.convertToNumber(amount);
        console.log("🚀 ~ file: user-wallet.service.js:23 ~ UserWalletService ~ changeBalance ~ amount:", amount)
        let newAmount = commonHelper.convertToNumber(userBalance?.wallet?.balance);
        if (newAmount === Infinity) {
            newAmount = 0;
        }
        newAmount += amount;
        userBalance.wallet.balance = newAmount;
        await userBalance.save();

        if (withHistory) {
            const transaction = await UserTransaction.create({
                action,
                actionAmount: amount,
                transactionId,
                prevBalance: userBalance?.balance || 0,
                balance: userBalance.wallet.balance,
                userId,
                data,
            });
        }
        return {
            userBalance
        }
    }

    async getTransactionHistory(
        conditions = {},
        pagination,
        projection = {},
        populate = [],
        sort = {}
    ) {
        const { limit, page, skip } = pagination;
        const {
            userId,
            actions,
        } = conditions;

        const filter = {
            isDeleted: false,
        };
        userId && (filter.userId = userId)

        const [items, total] = await Promise.all([
            UserTransaction.find(filter, projection).populate(populate).sort(sort).skip(skip).limit(limit),
            UserTransaction.countDocuments(filter),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async receiveDeposit(userId, depositAmount) {
        const data = await this.changeBalance(userId, depositAmount, null, USER_TRANSACTION_ACTION.DEPOSIT);
        return data;
    }
};

module.exports = new UserWalletService();
