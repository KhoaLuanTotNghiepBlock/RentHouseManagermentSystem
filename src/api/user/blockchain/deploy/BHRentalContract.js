require('dotenv').config();
const { BigNumber } = require("@ethersproject/bignumber");
const BN = require("bignumber.js");

const web3 = require("../config/web3-init");
const fs = require("fs");
const HashContract = require('../../../../model/transaction/hash-contract.model');
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
const Invoice = require('../../../../model/transaction/invoice.model');
const crypto = require('../../../../utils/crypto.hepler');
const Contract = require('../../../../model/transaction/contract.model');
const Notification = require('../../../../model/user/notification.model');
const { ADMIN } = require('../../../../config/default');
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
        const { wallet, _id } = await User.getUserByWallet(renterAddress);
        const signRenter = await RentalContract.createSigner(renterAddress);
        // // convert payment to ether
        let userPay = await vndToEth(rentAmount + depositAmount + 1000);
        const value = convertBalanceToWei(userPay);

        // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (userBalance < userPay)
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

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');

        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
        const { returnValues } = event[0];

        const room = await Room.findOneAndUpdate(
            { roomUid: returnValues._roomId, status: "available" },
            {
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

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id],
            content: `You pay to sign contract ${rentAmount + depositAmount}`
        });
        return { room, notification };
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
            gasLimit: 300000,
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

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id],
            content: 'create room for rent success!'
        })
        return {
            roomUpdate, notification
        }
    },

    reOpenRoomForRent: async (room, ownerAddress, amountRent, deposit) => {
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);

        amountRent = await vndToEth(amountRent);
        deposit = await vndToEth(deposit);
        const valueRent = convertBalanceToWei(amountRent); // price of room is wei
        const valueDeposit = convertBalanceToWei(deposit);
        const renterAbi = ContractRentalHouse.methods
            .reOpenRoomForRent(room.roomUid, valueRent, valueDeposit).encodeABI();

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
                { _id: room._id },
                {
                    lstTransaction: transactionHash,
                    status: "available",
                    roomUid: returnValues._roomId,
                }
            )
        ]);

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id],
            content: `you re-open room ${room.name} success`
        })
        return {
            roomUpdate, notification
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
        console.log("🚀 ~ file: BHRentalContract.js:212 ~ payForRentMonth: ~ roomUid:", roomUid)
        const { wallet, _id, username } = await User.getUserByWallet(renterAddress);
        const signRenter = await RentalContract.createSigner(renterAddress);
        // convert payment to ether
        const valueInvoiceFee = await vndToEth(invoiceAmount);
        const valuePay = await vndToEth(rentAmount);

        // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (userBalance < (valueInvoiceFee + valuePay))
            throw new MyError('renter not enough balance');

        const val = new BN(convertBalanceToWei(valueInvoiceFee));
        const invoiceHash = crypto.hash(invoice);
        const payRenter = ContractRentalHouse.methods.payForRentByMonth(roomUid, invoiceHash, val).encodeABI();
        const value = convertBalanceToWei(valueInvoiceFee + valuePay)

        const tx = {
            from: signRenter.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: BN(value).toNumber(),
            data: payRenter
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 2 seconds.') }, 2000);

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');
        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
        // const { returnValues } = event[0];

        // create invoice
        const invoiceUpdate = await Invoice.findOneAndUpdate(
            { _id: invoice._id },
            {
                payStatus: "Complete",
                txhash: signTransactionHash,
                paymentDate: new Date(),
                hash: invoiceHash
            }
        );
        // update user balance
        await userWalletService.changeBalance(
            _id,
            rentAmount,
            valueInvoiceFee + valuePay,
            USER_TRANSACTION_ACTION.PAY_FOR_RENT,
        );

        await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id],
            content: `You pay for invoice ${valueInvoiceFee + valuePay}`
        });
        // // update owner balance
        await userWalletService.changeBalance(
            invoice.contract.lessor,
            invoiceAmount + rentAmount,
            signTransactionHash,
            USER_TRANSACTION_ACTION.RECEIVE_INVOICE_PAYMENT,
        );

        await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [invoice.contract.lessor],
            content: `You receive from ${username} ${valueInvoiceFee + valuePay} for invoice`
        });

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id, invoice.contract.lessor],
            content: 'Invoice pay success!'
        });

        return { invoiceUpdate, notification };
    },

    endRent: async (ownerAddress, room, renterAddress) => {
        if (!ownerAddress || !room)
            throw new MyError('missing parameter');
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const renter = await User.getUserByWallet(renterAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);

        const { roomUid, deposit } = room;
        console.log("🚀 ~ file: BHRentalContract.js:254 ~ endRent: ~ roomUid, deposit :", roomUid, deposit)
        const endRentTransaction = ContractRentalHouse.methods.endRent(roomUid).encodeABI();
        const tx = {
            from: signOwner.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: 0,
            data: endRentTransaction
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => { throw new MyError(error) });
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => { throw new MyError(error) });
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 1 seconds.') }, 2000);

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse)
            .catch((error) => { throw new MyError(error) });

        if (event.length === 0) throw new MyError('event not found');

        const [updateRoom, updateContract] = await Promise.all([
            Room.updateOne(
                { _id: room._id },
                {
                    status: "not-available",
                    lstTransaction: signTransactionHash
                }),
            Contract.updateOne(
                { room: room._id, renter: renter._id },
                {
                    status: "not-available"
                })
        ]);

        if (updateRoom.modifiedCount < 1) throw new MyError('update room fail!');
        if (updateContract.modifiedCount < 1) throw new MyError('update contract fail!');

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id, renter._id],
            content: 'End rent room success'
        });

        // update user balance
        await userWalletService.changeBalance(
            renter._id,
            parseFloat(deposit),
            signTransactionHash,
            USER_TRANSACTION_ACTION.DEPOSIT,
        );

        await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [renter._id],
            content: `you receive deposit ${deposit}`
        });
        return { notification };
    },

    endRentInDue: async (ownerAddress, room, renterAddress, penaltyFee) => {
        if (!ownerAddress || !room)
            throw new MyError('missing parameter');
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const renter = await User.getUserByWallet(renterAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);

        const { roomUid, deposit } = room;
        const endRentTransaction = ContractRentalHouse.methods.endRent(roomUid).encodeABI();
        const tx = {
            from: signOwner.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: 0,
            data: endRentTransaction
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => { throw new MyError(error) });
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => { throw new MyError(error) });
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);

        await setTimeout(() => { console.log('Waited 1 seconds.') }, 1000);

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse)
            .catch((error) => { throw new MyError(error) });

        if (event.length === 0) throw new MyError('event not found');

        const [updateRoom, updateContract] = await Promise.all([
            Room.updateOne(
                { _id: room._id },
                {
                    status: "not-available",
                    lstTransaction: signTransactionHash
                }),
            Contract.updateOne(
                { room: room._id, renter: renter._id },
                {
                    status: "not-available"
                })
        ]);

        if (updateRoom.modifiedCount < 1) throw new MyError('update room fail!');
        if (updateContract.modifiedCount < 1) throw new MyError('update contract fail!');

        const notification = await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [_id, renter._id],
            content: 'End rent room success'
        });

        // update user balance
        await userWalletService.changeBalance(
            renter._id,
            parseFloat(deposit),
            signTransactionHash,
            USER_TRANSACTION_ACTION.DEPOSIT,
        );

        await Notification.create({
            userOwner: ADMIN._id,
            type: 'NOTIFICATION',
            tag: [renter._id],
            content: `you receive deposit ${deposit}`
        });
        return { notification };
    },

    getUserBalance: async (address) => {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        return balanceEth;
    },

    transferBalance: async (fromAddress, toAddress, amount, action = "transfer") => {
        const from = await RentalContract.createSigner(fromAddress);
        const { wallet } = await User.getUserByWallet(fromAddress);
        const to = await RentalContract.createSigner(toAddress);

        amount = await vndToEth(amount + 500);
        const value = new BN(convertBalanceToWei(amount));
        const pay = ContractRentalHouse.methods.transferBalance(from.address, to.address, value, action).encodeABI();

        const tx = {
            from: from.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: value,
            data: pay
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => { throw new MyError(error) });
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => { throw new MyError(error) });
        return txReceipt;
    },
}
module.exports = RentalContract;
