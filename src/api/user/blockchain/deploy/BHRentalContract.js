require('dotenv').config();
const web3 = require("../config/web3-init");
const fs = require("fs");
const MyError = require('../../../../exception/MyError');
const HashContract = require('../../../../model/transaction/hash-contract.model');
const ethers = require("ethers");
const User = require('../../../../model/user/user.model');
const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContract.json"));
const { SIGNER_PRIVATE_KEY } = process.env;
const network = "sepolia";
// Creating a signing account from a private key

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
    signByRenter: async (renterAddress, contractAddress, rentAmount, depositAmount) => {
        const { wallet } = await User.getUserByWallet(renterAddress);
        const rentalContract = new web3.eth.Contract(abi, contractAddress);
        const signRenter = await web3.eth.accounts.privateKeyToAccount(
            wallet.walletPrivateKey
        );
        // convert payment to ether
        const value = web3.utils.toWei(rentAmount + depositAmount, 'ether');

        const signRenterAbi = rentalContract.methods.signByRenter().encodeABI();

        const tx = {
            from: signRenter.address,
            to: contractAddress,
            gas: await signRenterAbi.estimateGas(),
            value: value,
            data: signRenterAbi
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.walletPrivateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(txReceipt);
        return txReceipt;
    },

    signByOwner: async (ownerAddress, contractAddress) => {
        const { wallet } = await User.getUserByWallet(ownerAddress);
        const signOwner = await web3.eth.accounts.privateKeyToAccount(
            wallet.walletPrivateKey
        );
        // Create a new instance of the RentalContract smart contract
        const rentalContract = new web3.eth.Contract(abi, contractAddress);
        // Call the signByRenter function in the smart contract and pass the renter's address
        const tx = rentalContract.methods.signByOwner();
        const receipt = await tx.call({ from: signOwner.address, gas: await tx.estimateGas() });
        // rr: true, message: 'Contract signed by renter', 
        return { receipt };
    },

    setRoomForRent: async (contractHash, amountRent, deposit) => {

    },

    readContract: async (
        nameFunction,
        params,
        delay = 1000,
        maxTries = 10,
        retries = 0
    ) => {
        // Create a new instance of the RentalContract smart contract
        const rentalContract = new web3.eth.Contract(abi, contractAddress);
        return rentalContract.methods[nameFunction](...params)
            .call()
            .then((result) => {
                return result;
            })
            .catch(() => {
                if (retries < maxTries) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            return resolve(
                                _this.readContractData(
                                    contractAddress,
                                    nameFunction,
                                    params,
                                    delay,
                                    maxTries,
                                    retries + 1
                                )
                            );
                        }, delay || 1500);
                    });
                }
                return null;
            });
    }




}
module.exports = RentalContract;