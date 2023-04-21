require("dotenv").config();
const {BigNumber} = require("@ethersproject/bignumber");
const BN = require("bignumber.js");

const web3 = require("../config/web3-init");
const fs = require("fs");
const HashContract = require("../../../../model/transaction/hash-contract.model");
const User = require("../../../../model/user/user.model");
const MyError = require("../../../../exception/MyError");
const Room = require("../../../../model/room.model");
const userWalletService = require("../../service/user-wallet.service");
const {vndToEth, ethToVND, calculateNumber, convertBalanceToWei, convertBalanceWeiToETH} = require("../../../../utils/blockchain");
const {abi, bytecode} = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContractV2.json"));
const {SIGNER_PRIVATE_KEY} = process.env;
// Creating a signing account from a private key
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ContractRentalHouse = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
const {USER_TRANSACTION_ACTION} = require("../../../../config/user-transaction");
const Invoice = require("../../../../model/transaction/invoice.model");
const crypto = require("../../../../utils/crypto.hepler");
const Contract = require("../../../../model/transaction/contract.model");
const Notification = require("../../../../model/user/notification.model");
const {ADMIN} = require("../../../../config/default");
// 🚀 ~ file: test.test.js:23 ~ eth: 0.0005599012590399969
// 🚀 ~ file: test.test.js:25 ~ vnd: 23000
const RentalContract = {};

RentalContract.createSigner = async (userAddress) => {
    const {wallet} = await User.getUserByWallet(userAddress);
    const signer = await web3.eth.accounts.privateKeyToAccount(wallet.walletPrivateKey);
    return signer;
};
RentalContract.signByRenter = async (renterAddress, contractHash, roomUid, rentAmount, depositAmount) => {
    // Get user's wallet and ID by renter address
    const {wallet, _id} = await User.getUserByWallet(renterAddress);

    // Create signer for renter
    const signRenter = await RentalContract.createSigner(renterAddress);
    // // convert payment to ether
    let userPay = await vndToEth(rentAmount + depositAmount + 1000);
    const value = convertBalanceToWei(userPay);

    // check balance of renter
    const userBalance = await RentalContract.getUserBalance(signRenter.address);
    if (userBalance < userPay) throw new MyError("người dùng không đủ tiền!");

    const signRenterAbi = ContractRentalHouse.methods.signByRenter(roomUid, contractHash).encodeABI();
    const tx = {
        from: signRenter.address,
        to: CONTRACT_ADDRESS,
        gasLimit: web3.utils.toHex(300000),
        value: value,
        data: signRenterAbi,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const signTransactionHash = txReceipt.transactionHash;
    console.log(txReceipt);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
    if (event.length === 0) throw new MyError("event not found");

    console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event);
    const {returnValues} = event[0];

    const room = await Room.findOneAndUpdate(
        {roomUid: returnValues._roomId, status: "available"},
        {
            status: "already-rent",
            lstTransaction: signTransactionHash,
        }
    );

    await userWalletService.changeBalance(_id, rentAmount + depositAmount, signTransactionHash, USER_TRANSACTION_ACTION.SIGN_CONTRACT);

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: `bạn đã trả phí cho ký xác nhận với khoản tiền ${rentAmount + depositAmount}`,
    });
    return {room, notification};
};

RentalContract.setRoomForRent = async (roomId, ownerAddress, amountRent, deposit) => {
    const {wallet, _id} = await User.getUserByWallet(ownerAddress);
    const signOwner = await RentalContract.createSigner(ownerAddress);
    amountRent = await vndToEth(amountRent);
    deposit = await vndToEth(deposit);
    const valueRent = new BN(convertBalanceToWei(amountRent)); // price of room is wei
    const valueDeposit = new BN(convertBalanceToWei(deposit));
    const renterAbi = ContractRentalHouse.methods.setRoomForRent(valueRent, valueDeposit).encodeABI();

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
    console.log("🚀 ~ file: BHRentalContract.js:166 ~ setRoomForRent: ~ event:", event);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    if (event.length === 0) throw new MyError("event not found");
    const {returnValues} = event[0];
    const [roomUpdate] = await Promise.all([
        Room.findOneAndUpdate(
            {_id: roomId},
            {
                lstTransaction: transactionHash,
                status: "available",
                roomUid: returnValues._roomId,
            }
        ),
    ]);
    // update user balance
    await userWalletService.changeBalance(_id, 5000, null, USER_TRANSACTION_ACTION.CREATE_ROOM);

    await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: `bạn đã thanh toán 5000 VND cho tạo phòng thuê!`,
    });

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: "tạo phòng cho thuê thành công!",
    });
    return {
        roomUpdate,
        notification,
    };
};
RentalContract.reOpenRoomForRent = async (room, ownerAddress, amountRent, deposit) => {
    const {wallet, _id} = await User.getUserByWallet(ownerAddress);
    const signOwner = await RentalContract.createSigner(ownerAddress);

    amountRent = await vndToEth(amountRent);
    deposit = await vndToEth(deposit);
    const valueRent = new BN(convertBalanceToWei(amountRent)); // price of room is wei
    const valueDeposit = new BN(convertBalanceToWei(deposit));
    const renterAbi = ContractRentalHouse.methods.reOpenRoomForRent(room.roomUid, valueRent, valueDeposit).encodeABI();

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
    console.log("🚀 ~ file: BHRentalContract.js:166 ~ setRoomForRent: ~ event:", event);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    if (event.length === 0) throw new MyError("event not found");
    const {returnValues} = event[0];
    const [roomUpdate] = await Promise.all([
        Room.findOneAndUpdate(
            {_id: room._id},
            {
                lstTransaction: transactionHash,
                status: "available",
                roomUid: returnValues._roomId,
            }
        ),
    ]);

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: `mở lại cho thuê phòng ${room.name} thành công`,
    });
    return {
        roomUpdate,
        notification,
    };
};

RentalContract.getGetEventFromTransaction = async (txHash, contract) => {
    try {
        const transaction = await web3.eth.getTransaction(txHash);
        const blockNumber = transaction?.blockNumber;
        if (!blockNumber) return;
        const events = await contract.getPastEvents("allEvents", {
            fromBlock: blockNumber,
            toBlock: blockNumber,
        });
        return events;
    } catch (error) {
        throw new MyError(error);
    }
};
RentalContract.payForRentMonth = async (renterAddress, roomUid, invoice, invoiceAmount, rentAmount) => {
    const {wallet, _id, username} = await User.getUserByWallet(renterAddress);
    const signRenter = await RentalContract.createSigner(renterAddress);
    // convert payment to ether
    const valueInvoiceFee = await vndToEth(invoiceAmount);
    const valuePay = await vndToEth(rentAmount);

    // check balance of renter
    const userBalance = await RentalContract.getUserBalance(signRenter.address);
    if (userBalance < valueInvoiceFee + valuePay || wallet.balance < invoiceAmount + rentAmount) throw new MyError("số dư không đủ!");

    const val = new BN(convertBalanceToWei(valueInvoiceFee));
    const invoiceHash = crypto.hash(invoice);
    const payRenter = ContractRentalHouse.methods.payForRentByMonth(roomUid, invoiceHash, val).encodeABI();
    const value = convertBalanceToWei(valueInvoiceFee + valuePay);

    const tx = {
        from: signRenter.address,
        to: CONTRACT_ADDRESS,
        gasLimit: 300000,
        value: BN(value).toNumber(),
        data: payRenter,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => {
        throw new MyError(error);
    });
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => {
        throw new MyError(error);
    });
    const signTransactionHash = txReceipt.transactionHash;
    console.log(txReceipt);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
    if (event.length === 0) throw new MyError("event not found");
    console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event);
    // const { returnValues } = event[0];

    // create invoice
    const invoiceUpdate = await Invoice.findOneAndUpdate(
        {_id: invoice._id},
        {
            payStatus: "Complete",
            txhash: signTransactionHash,
            paymentDate: new Date(),
            hash: invoiceHash,
        }
    );
    // update user balance
    await userWalletService.changeBalance(_id, invoiceAmount + rentAmount, signTransactionHash, USER_TRANSACTION_ACTION.PAY_FOR_RENT);

    await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: `bạn đã thanh toán hoá đơn với khoản ${invoiceAmount + rentAmount} thành công!`,
    });
    // // update owner balance
    await userWalletService.changeBalance(
        invoice.contract.lessor,
        invoiceAmount + rentAmount,
        signTransactionHash,
        USER_TRANSACTION_ACTION.RECEIVE_INVOICE_PAYMENT
    );

    await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [invoice.contract.lessor],
        content: `bạn nhận được từ ${username} khoản ${invoiceAmount + rentAmount} thanh toán tiền dịch vụ`,
    });

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id, invoice.contract.lessor],
        content: "thanh toán hoá đơn thành công",
    });

    return {invoiceUpdate, notification};
};

RentalContract.endRent = async (ownerAddress, room, renterAddress) => {
    if (!ownerAddress || !room) throw new MyError("missing parameter");
    const {wallet, _id} = await User.getUserByWallet(ownerAddress);
    const renter = await User.getUserByWallet(renterAddress);
    const signOwner = await RentalContract.createSigner(ownerAddress);

    const {roomUid, deposit} = room;
    const endRentTransaction = ContractRentalHouse.methods.endRent(roomUid).encodeABI();
    const tx = {
        from: signOwner.address,
        to: CONTRACT_ADDRESS,
        gasLimit: 300000,
        value: 0,
        data: endRentTransaction,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => {
        throw new MyError(error);
    });
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => {
        throw new MyError(error);
    });
    const signTransactionHash = txReceipt.transactionHash;
    console.log(txReceipt);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse).catch((error) => {
        throw new MyError(error);
    });

    if (event.length === 0) throw new MyError("event not found");

    const [updateRoom, updateContract] = await Promise.all([
        Room.updateOne(
            {_id: room._id},
            {
                status: "not-available",
                lstTransaction: signTransactionHash,
            }
        ),
        Contract.updateOne(
            {room: room._id, renter: renter._id},
            {
                status: "not-available",
            }
        ),
    ]);

    if (updateRoom.modifiedCount < 1) throw new MyError("update room fail!");
    if (updateContract.modifiedCount < 1) throw new MyError("update contract fail!");

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id, renter._id],
        content: "kết thúc thuê thành công!",
    });

    // update user balance
    await userWalletService.changeBalance(renter._id, parseFloat(deposit), signTransactionHash, USER_TRANSACTION_ACTION.DEPOSIT);

    await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [renter._id],
        content: `bạn nhận lại tiền cọc ${deposit}`,
    });
    return {notification};
};

RentalContract.endRentInDue = async (ownerAddress, room, renterAddress, penaltyFee = 0) => {
    if (!ownerAddress || !room) throw new MyError("missing parameter");
    const {wallet, _id} = await User.getUserByWallet(ownerAddress);
    const renter = await User.getUserByWallet(renterAddress);
    const signOwner = await RentalContract.createSigner(ownerAddress);
    const valuePay = await vndToEth(penaltyFee);

    const val = new BN(convertBalanceToWei(valuePay));

    const {roomUid, deposit} = room;
    const endRentTransaction = ContractRentalHouse.methods.endRentWithPenalty(roomUid, val).encodeABI();
    const tx = {
        from: signOwner.address,
        to: CONTRACT_ADDRESS,
        gasLimit: 300000,
        value: val,
        data: endRentTransaction,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, renter.wallet.walletPrivateKey).catch((error) => {
        throw new MyError(error);
    });
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => {
        throw new MyError(error);
    });
    const signTransactionHash = txReceipt.transactionHash;
    console.log(txReceipt);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse).catch((error) => {
        throw new MyError(error);
    });

    if (event.length === 0) throw new MyError("event not found");

    const [updateRoom, updateContract] = await Promise.all([
        Room.updateOne(
            {_id: room._id},
            {
                status: "not-available",
                lstTransaction: signTransactionHash,
            }
        ),
        Contract.updateOne(
            {room: room._id, renter: renter._id},
            {
                status: "not-available",
            }
        ),
    ]);

    if (updateRoom.modifiedCount < 1) throw new MyError("update room fail!");
    if (updateContract.modifiedCount < 1) throw new MyError("update contract fail!");

    const notification = await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id, renter._id],
        content: "kết thúc thuê thành công!",
    });

    // lessor receive the deposit of renter
    await userWalletService.changeBalance(_id, parseFloat(deposit), signTransactionHash, USER_TRANSACTION_ACTION.DEPOSIT);

    await Notification.create({
        userOwner: ADMIN._id,
        type: "NOTIFICATION",
        tag: [_id],
        content: `bạn nhận được khoản tiền cọc từ phòng ${room.name}: ${deposit}`,
    });
    return {notification};
};

RentalContract.getUserBalance = async (address) => {
    const balanceWei = await web3.eth.getBalance(address);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    return balanceEth;
};
RentalContract.transferBalance = async (fromAddress, toAddress, amount, action = "transfer") => {
    const from = await RentalContract.createSigner(fromAddress);
    const {wallet} = await User.getUserByWallet(fromAddress);
    const to = await RentalContract.createSigner(toAddress);

    amount = await vndToEth(amount + 500);
    const value = new BN(convertBalanceToWei(amount));
    const pay = ContractRentalHouse.methods.transferBalance(from.address, to.address, value, action).encodeABI();

    const tx = {
        from: from.address,
        to: CONTRACT_ADDRESS,
        gasLimit: 300000,
        value: value,
        data: pay,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => {
        throw new MyError(error);
    });
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => {
        throw new MyError(error);
    });
    return txReceipt;
};

RentalContract.extendsContract = async (ownerAddress, roomUid, contractHash) => {
    if (!ownerAddress || !roomUid || !contractHash) throw new MyError("missing parameter");
    const {wallet, _id} = await User.getUserByWallet(ownerAddress);
    const signOwner = await RentalContract.createSigner(ownerAddress);

    const extendRent = ContractRentalHouse.methods.extendRentalRoom(roomUid, contractHash).encodeABI();
    const tx = {
        from: signOwner.address,
        to: CONTRACT_ADDRESS,
        gasLimit: 300000,
        value: 0,
        data: extendRent,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey).catch((error) => {
        throw new MyError(error);
    });
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((error) => {
        throw new MyError(error);
    });
    const signTransactionHash = txReceipt.transactionHash;
    console.log(txReceipt);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse).catch((error) => {
        throw new MyError(error);
    });
    return {txHash: signTransactionHash, roomUid, contractHash};
};

module.exports = RentalContract;
