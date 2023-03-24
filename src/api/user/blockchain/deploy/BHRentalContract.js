require('dotenv').config();
const web3 = require("../config/web3-init");
const fs = require("fs");
const HashContract = require('../../../../model/transaction/hash-contract.model');
const RoomTransaction = require('../../../../model/transaction/room-transaction.model');
const User = require('../../../../model/user/user.model');
const MyError = require('../../../../exception/MyError');
const Room = require('../../../../model/room.model');
const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContractV2.json"));
const { SIGNER_PRIVATE_KEY } = process.env;
const network = "sepolia";
// Creating a signing account from a private key
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
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

    // signByRenter: async (renterAddress, contractAddress, rentAmount) => {
    //     const { wallet } = await User.getUserByWallet(renterAddress);
    //     // const signRenter = await web3.eth.accounts.privateKeyToAccount(
    //     //     wallet.walletPrivateKey
    //     // );
    //     // Create a new instance of the RentalContract smart contract
    //     const rentalContract = new web3.eth.Contract(abi, contractAddress);

    //     // Call the signByRenter function in the smart contract and pass the renter's address
    //     const tx = rentalContract.methods.signByRenter();
    //     // 7. Sign tx with PK
    //     const createTransaction = await web3.eth.accounts.signTransaction(
    //         {
    //             to: contractAddress,
    //             data: tx.encodeABI(),
    //             gas: await tx.estimateGas(),
    //         },
    //         wallet.walletPrivateKey
    //     );

    //     // 8. Send tx and wait for receipt
    //     const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    //     console.log(`Tx successful with hash: ${createReceipt.transactionHash}`);

    //     // const receipt = await tx.call({ from: signRenter.address, value: rentAmount });
    //     // rr: true, message: 'Contract signed by renter', 
    //     return { createReceipt };
    // },
    signByRenter: async (renterAddress, contractHash, roomUid) => {
        const { wallet } = await User.getUserByWallet(renterAddress);

        const rentalContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const signRenter = await RentalContract.createSigner(renterAddress)
        // convert payment to ether
        const value = web3.utils.toWei(rentAmount + depositAmount, 'ether');
        // check balance of renter
        const userBalance = await RentalContract.getUserBalance(signRenter.address);
        if (userBalance < value)
            throw new MyError('renter not enough balance');

        const signRenterAbi = rentalContract.methods.signByRenter(roomUid, contractHash).encodeABI();

        const tx = {
            from: signRenter.address,
            to: CONTRACT_ADDRESS,
            gas: await signRenterAbi.estimateGas(),
            value: value,
            data: signRenterAbi
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signTransactionHash = txReceipt.transactionHash;

        console.log(txReceipt);
        const event = await RentalContract.getGetEventFromTransaction(signTransactionHash, rentalContract);
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

        if (!roomTransaction.isModified()) throw new MyError('transaction update fail');

        return roomTransaction;
    },

    setRoomForRent: async (roomId, ownerAddress, amountRent, deposit) => {
        const { wallet, _id } = await User.getUserByWallet(ownerAddress);
        const signOwner = await RentalContract.createSigner(ownerAddress);
        const rentalContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const renterAbi = rentalContract.methods.setRoomForRent(amountRent, deposit).encodeABI();
        // Estimatic the gas limit
        const limit = await web3.eth.estimateGas();

        const tx = {
            from: signOwner.address,
            to: CONTRACT_ADDRESS,
            gas: 3000000,
            data: renterAbi,
            value: 0,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const transactionHash = txReceipt.transactionHash;

        const event = await RentalContract.getGetEventFromTransaction(transactionHash, rentalContract);
        if (event.length === 0) throw new MyError('event not found');
        console.log("🚀 ~ file: BHRentalContract.js:151 ~ setRoomForRent: ~ event:", event)
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

        if (!roomTransaction.isModified()) throw new MyError('create room transaction fail!');
        if (!roomUpdate.isModified()) throw new MyError('update room  fail!');
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

    payForRentMonth: async (renterAddress, roomUid, invoiceHash) => { },

    getUserBalance: async (address) => {
        const balanceWei = await web3.eth.getBalance(address);
        console.log("🚀 ~ file: BHRentalContract.js:168 ~ getUserBalance: ~ balanceWei:", balanceWei)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        return balanceEth;
    }
}
module.exports = RentalContract;
