const web3 = require("../config/web3-init");

const fs = require("fs");
const contractService = require("../../service/contract.service");
const MyError = require('../../../../exception/MyError');
const HashContract = require('../../../../model/transaction/hash-contract.model');

const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContract.json"));

const RentalContract = {
    createSmartContractFromRentalContract: async (contractInfo, ownerAddress, renterAddress) => {
        if (!(signedByOwner && signedByRenter))
            throw new MyError('Sign is missing!');
        // get info of contract
        const { contractId, rentAumont, depositAmount } = contractInfo;

        // then hash all info of contract
        const hash = await contractService.hashContract(contractId);
        if (!hash)
            throw new MyError('Contract info invalid!');

        let contractHash = new HashContract({
            contractId,
            hash
        });

        // create new instance of smart contract
        const contract = new web3.eth.Contract(abi);
        const deploy = contract.deploy({ data: '0x' + bytecode, arguments: [contractHash.hash, ownerAddress, renterAddress, rentAumont, depositAmount] });

        // Creating a signing account from a private key
        // web3.eth.accounts.wallet.add(signer);
        // Send contract deployment transaction
        const gas = await deploy.estimateGas();
        // const result = await deploy.send({ from: signer.address, gas });

        // contractHash.contractAddress = result.options.address;
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
    }

}
module.exports = RentalContract;