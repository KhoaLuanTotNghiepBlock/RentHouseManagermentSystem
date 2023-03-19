require('dotenv').config();
const web3 = require("../config/web3-init");
const fs = require("fs");
const MyError = require('../../../../exception/MyError');
const HashContract = require('../../../../model/transaction/hash-contract.model');

const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContract.json"));
const { SIGNER_PRIVATE_KEY } = process.env;
// Creating a signing account from a private key
const signer = web3.eth.accounts.privateKeyToAccount(
    SIGNER_PRIVATE_KEY
);
const RentalContract = {
    createSmartContractFromRentalContract: async (contractInfo, ownerAddress, renterAddress) => {
        // get info of contract
        const { contractId, rentAumont, depositAmount, hash } = contractInfo;

        let contractHash = new HashContract({
            contractId,
            hash
        });
        // create new instance of smart contract
        const contract = new web3.eth.Contract(abi);
        const deploy = contract.deploy({ data: '0x' + bytecode, arguments: [contractHash.hash, ownerAddress, renterAddress, rentAumont, depositAmount] });

        // Creating a signing account from a private key
        web3.eth.accounts.wallet.add(signer);
        // Send contract deployment transaction
        const gas = await deploy.estimateGas();
        console.log("🚀 ~ file: BHRentalContract.js:27 ~ createSmartContractFromRentalContract: ~ gas:", gas)
        const result = await deploy.send({ from: signer.address, gas });

        contractHash.contractAddress = result.options.address;
        // save to data base
        await contractHash.save();
        return {
            contractAddress: result.options.address
        };
    },

    getSmartContract: async (contractAddress) => {
        console.log("🚀 ~ file: BHRentalContract.js:48 ~ getSmartContract: ~ contractAddress:", contractAddress)
        if (!contractAddress)
            throw new MyError('contract address invalid')
        // Creating a signing account from a private key
        // web3.eth.accounts.wallet.add(signer);

        // create new instance of smart contract
        const contract = new web3.eth.Contract(abi, contractAddress);
        // Issuing a transaction that calls
        const contractInfo = await contract.methods.getContractTransactionId().call();
        // const gas = await contractInfo.estimateGas();
        // const receipt = await contractInfo.send({ from: signer.address, gas });
        // // const receipt = await contractInfo.send({ from: signer.address, gas: contractInfo.estimateGas() });
        // console.log("🚀 ~ file: BHRentalContract.js:57 ~ getSmartContract: ~ receipt:", receipt);

        return contractInfo;
    },

    signByRenter: async (renterAddress, contractAddress, rentAmount) => {
        // Create a new instance of the RentalContract smart contract
        const rentalContract = new web3.eth.Contract(abi, contractAddress);

        // Call the signByRenter function in the smart contract and pass the renter's address
        const receipt = await rentalContract.methods.signByRenter().send({ from: renterAddress, value: rentAmount });
        // rr: true, message: 'Contract signed by renter', 
        return { receipt };
    },

    signByOwner: async (ownerAddress, contractAddress) => {
        // Create a new instance of the RentalContract smart contract
        const rentalContract = new web3.eth.Contract(abi, contractAddress);

        // Call the signByRenter function in the smart contract and pass the renter's address
        const receipt = await rentalContract.methods.signByOwner().send({ from: ownerAddress });
        // rr: true, message: 'Contract signed by renter', 
        return { receipt };
    },

}
module.exports = RentalContract;