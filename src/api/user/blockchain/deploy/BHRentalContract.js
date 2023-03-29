require('dotenv').config();
const { BigNumber } = require("@ethersproject/bignumber");
const web3 = require("../config/web3-init");
const fs = require("fs");
const HashContract = require('../../../../model/transaction/hash-contract.model');
const RoomTransaction = require('../../../../model/transaction/room-transaction.model');
const User = require('../../../../model/user/user.model');
const MyError = require('../../../../exception/MyError');
const Room = require('../../../../model/room.model');
const userWalletService = require('../../service/user-wallet.service');
const { vndToEth, ethToVND, calculateNumber, convertBalanceToWei, convertBalanceWeiToETH } = require('../../../../utils/blockchain');
const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContractV2.json"));
const { SIGNER_PRIVATE_KEY } = process.env;
// Creating a signing account from a private key
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ContractRentalHouse = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
const { USER_TRANSACTION_ACTION } = require('../../../../config/user-transaction');
const InvoiceTransaction = require('../../../../model/transaction/invoice-transaction');
const Invoice = require('../../../../model/transaction/invoice.model');
const crypto = require('../../../../utils/crypto.hepler');
const Contract = require('../../../../model/transaction/contract.model');
// 🚀 ~ file: test.test.js:23 ~ eth: 0.0005599012590399969
// 🚀 ~ file: test.test.js:25 ~ vnd: 23000
const RentalContract = {

    createSigner: async (userAddress) => {
        const { wallet } = await User.getUserByWallet(userAddress);
        const signer = await web3.eth.accounts.privateKeyToAccount(
            wallet.walletPrivateKey
        );
        return signer;
    },

    signByRenter: async (renterAddress, contractHash, roomUid, rentAmount, depositAmount) => {
        console.log("🚀 ~ file: BHRentalContract.js:67 ~ signByRenter: ~ renterAddress, contractHash, roomUid, rentAmount, depositAmount:", renterAddress, contractHash, roomUid, rentAmount, depositAmount)
        const { wallet, _id } = await User.getUserByWallet(renterAddress);
        const signRenter = await RentalContract.createSigner(renterAddress);
        // // convert payment to ether
        const userPay = rentAmount + depositAmount;
        rentAmount = await vndToEth(rentAmount);
        depositAmount = await vndToEth(depositAmount);
        const valueRent = convertBalanceToWei(rentAmount); // price of room is wei
        const valueDeposit = convertBalanceToWei(depositAmount);
        const value = valueRent + valueDeposit + 50;

        // // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (convertBalanceToWei(userBalance) < value)
            throw new MyError('renter not enough balance');

        const signRenterAbi = ContractRentalHouse.methods.signByRenter(roomUid, contractHash).encodeABI();
        const tx = {
            from: signRenter.address,
            to: CONTRACT_ADDRESS,
            gasLimit: web3.utils.toHex(300000),
            value: value,
            data: signRenterAbi
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 2 seconds.') }, 2000);

        // const signTransactionHash = "0xbcef270a2e722afea66d1f0d07adbc1c883281a6f35dd3417b52795366809af9"

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');

        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
        const { returnValues } = event[0];

        const room = await Room.findOneAndUpdate(
            { roomUid: returnValues._roomId, status: "available" },
            {
                renter: returnValues.renter,
                value: 0,
                status: "already-rent",
                lstTransaction: signTransactionHash
            }
        );

        await userWalletService.changeBalance(
            _id,
            userPay,
            signTransactionHash,
            USER_TRANSACTION_ACTION.SIGN_CONTRACT
        );
        return room;
    },

    setRoomForRent: async (roomId, ownerAddress, amountRent, deposit) => {
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);

        amountRent = await vndToEth(amountRent);
        deposit = await vndToEth(deposit);
        const valueRent = convertBalanceToWei(amountRent); // price of room is wei
        const valueDeposit = convertBalanceToWei(deposit);
        const renterAbi = ContractRentalHouse.methods
            .setRoomForRent(valueRent, valueDeposit).encodeABI();

        const tx = {
            from: signOwner.address,
            to: CONTRACT_ADDRESS,
            gasLimit: web3.utils.toHex(300000),
            data: renterAbi,
            value: 0,
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        const transactionHash = txReceipt.transactionHash;
        const event = await RentalContract.getGetEventFromTransaction(transactionHash, ContractRentalHouse);
        console.log("🚀 ~ file: BHRentalContract.js:166 ~ setRoomForRent: ~ event:", event)

        await setTimeout(() => { console.log('Waited 2 seconds.') }, 2000);

        if (event.length === 0) throw new MyError('event not found');
        const { returnValues } = event[0];
        const [roomUpdate] = await Promise.all([
            Room.findOneAndUpdate(
                { _id: roomId },
                {
                    lstTransaction: transactionHash,
                    status: "available",
                    roomUid: returnValues._roomId,
                }
            )
        ]);
        return {
            roomUpdate
        }
    },

    getGetEventFromTransaction: async (txHash, contract) => {
        try {
            const transaction = await web3.eth.getTransaction(txHash);
            const blockNumber = transaction.blockNumber;
            console.log('Transaction confirmed in block:', blockNumber);

            const events = await contract.getPastEvents('allEvents', { fromBlock: blockNumber, toBlock: blockNumber });
            return events;
        } catch (error) {
            throw new MyError(error);
        }
    },

    payForRentMonth: async (renterAddress, roomUid, invoice, invoiceAmount, rentAmount) => {
        const { wallet, _id } = await User.getUserByWallet(renterAddress);
        const signRenter = await RentalContract.createSigner(renterAddress);
        // convert payment to ether
        const valueInvoiceFee = await vndToEth(invoiceAmount);
        const valuePay = await vndToEth(rentAmount);
        // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (userBalance < value)
            throw new MyError('renter not enough balance');

        const invoiceHash = crypto.hash(invoice);
        const payRenter = ContractRentalHouse.methods.payForRentByMonth(roomUid, invoiceHash, convertBalanceToWei(valueInvoiceFee)).encodeABI();

        const tx = {
            from: signRenter.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: convertBalanceToWei(valueInvoiceFee + valuePay),
            data: payRenter
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 1 seconds.') }, 2000);

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');
        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
        const { returnValues } = event[0];

        // create invoice
        const invoiceUpdate = await Invoice.findOneAndUpdate(
            { _id: invoice._id },
            {
                payStatus: "Complete",
                txhash: signTransactionHash,
                paymentDate: new Date(),
                hash: invoiceHash
            }
        )
        // update user balance
        await userWalletService.changeBalance(
            _id,
            rentAmount,
            valueInvoiceFee + valuePay,
            USER_TRANSACTION_ACTION.PAY_FOR_RENT,
        );

        return invoiceUpdate;
    },

    endRent: async (ownerAddress, roomUid) => {
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);

        const endRentTransaction = ContractRentalHouse.methods.endRent(roomUid).encodeABI();
        const tx = {
            from: signOwner.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: 0,
            data: endRentTransaction
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 1 seconds.') }, 1000);

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');
        const { returnValues } = event[0];
        // get room 
        const roomTransaction = await RoomTransaction.findOne({
            owner: _id,
            roomUid,
            status: "already-rent"
        });
        if (!roomTransaction) throw new MyError('Room not found');

        // return deposit for us
        const { roomId, renter } = roomTransaction;
        const renterUser = await User.getUserByWallet(renter);

        const room = await Room.findOne({ _id: roomId });
        console.log("🚀 ~ file: BHRentalContract.js:255 ~ endRent: ~ room:", room)
        room.status = "available"
        room.save();

        const contract = await Contract.findOne({ renter: renterUser._id, lessor: _id });
        contract.status = "not-available";
        contract.save();

        // update user balance
        await userWalletService.changeBalance(
            renterUser._id,
            parseFloat(room.deposit),
            signTransactionHash,
            USER_TRANSACTION_ACTION.DEPOSIT,
        );

        return roomTransaction;
    },

    getUserBalance: async (address) => {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        return balanceEth;
    },
}
module.exports = RentalContract;
