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
// 🚀 ~ file: test.test.js:23 ~ eth: 0.0005599012590399969
// 🚀 ~ file: test.test.js:25 ~ vnd: 23000
const RentalContract = {
    createSmartContractFromRentalContract: async (contractInfo, ownerAddress, renterAddress) => {
        // get info of contract
        const { contractId, rentAumont, depositAmount, hash } = contractInfo;

        let contractHash = new HashContract({
            contractId,
            hash
        });
        const signer = web3.eth.accounts.privateKeyToAccount(
            SIGNER_PRIVATE_KEY
        );
        // create new instance of smart contract
        const contract = new web3.eth.Contract(abi);
        const deploy = contract.deploy({ data: '0x' + bytecode, arguments: [contractHash.hash, ownerAddress, renterAddress, rentAumont, depositAmount] });

        // Creating a signing account from a private key
        web3.eth.accounts.wallet.add(signer);
        // Send contract deployment transaction
        const gas = await deploy.estimateGas();

        const result = await deploy.send({ from: signer.address, gas })
            .once("transactionHash", (txhash) => {
                contractHash.txhash = txhash;
                console.log(`Mining deployment transaction ...`);
                console.log(`https://${network}.etherscan.io/tx/${txhash}`);
            });

        contractHash.contractAddress = result.options.address;
        // save to data base
        await contractHash.save();
        return {
            contractAddress: result.options.address,
            txhash: contractHash.txhash
        };
    },

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
        // convert payment to ether
        const value = await vndToEth(rentAmount + depositAmount);
        // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (userBalance < value)
            throw new MyError('renter not enough balance');

        const signRenterAbi = ContractRentalHouse.methods.signByRenter(roomUid, contractHash).encodeABI();

        const tx = {
            from: signRenter.address,
            to: CONTRACT_ADDRESS,
            gasLimit: 300000,
            value: convertBalanceToWei(value),
            data: signRenterAbi
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;
        console.log(txReceipt);
        setTimeout(() => { console.log('Waited 2 seconds.') }, 2000);

        // const signTransactionHash = "0xbcef270a2e722afea66d1f0d07adbc1c883281a6f35dd3417b52795366809af9"

        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, ContractRentalHouse);
        if (event.length === 0) throw new MyError('event not found');
        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
        const { returnValues } = event[0];

        const roomTransaction = await RoomTransaction.findOneAndUpdate(
            { roomUid: returnValues._roomId, status: "available" },
            {
                renter: returnValues.renter,
                value: 0,
                status: "already-rent",
                transactionHash: signTransactionHash
            }
        );

        await userWalletService.changeBalance(
            _id,
            -(rentAmount + depositAmount),
            signTransactionHash,
            USER_TRANSACTION_ACTION.SIGN_CONTRACT
        );
        return roomTransaction;
    },

    setRoomForRent: async (roomId, ownerAddress, amountRent, deposit) => {
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);
        // const rentalContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
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

        setTimeout(() => { console.log('Waited 2 seconds.') }, 2000);

        if (event.length === 0) throw new MyError('event not found');
        const { returnValues } = event[0];
        const [roomTransaction, roomUpdate] = await Promise.all([
            RoomTransaction.create({
                transactionHash,
                owner: _id,
                status: "available",
                roomUid: returnValues._roomId,
                roomId,
                value: amountRent + deposit
            }),
            Room.findOneAndUpdate(
                { _id: roomId },
                { lstTransaction: transactionHash }
            )
        ]);
        return {
            roomTransaction
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

    payForRentMonth: async (renterAddress, roomUid, invoiceHash) => {

    },

    getUserBalance: async (address) => {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        return balanceEth;
    },


}
module.exports = RentalContract;
