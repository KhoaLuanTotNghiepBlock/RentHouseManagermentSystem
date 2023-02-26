const { web3, signer } = require('../config/web3-init');
const solc = require('solc');

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require("fs");
const contractService = require('../../service/contract.service');
const MyError = require('../../../../exception/MyError');
const HashContract = require('../../../../model/transaction/hash-contract.model');

const { abi, bytecode } = JSON.parse(fs.readFileSync("src/api/user/blockchain/contract/RentalContract.json"));

const RentalContract = {
    createSmartContractFromRentalContract: async (contractId, signedByOwner, signedByRenter) => {
        if (!(signedByOwner && signedByRenter))
            throw new MyError('Sign is missing!');
        // get info of contract
        // then hash all info of contract
        const hash = await contractService.hashContract(contractId);
        if (!hash)
            throw new MyError('Contract info invalid!');

        const contractHash = new HashContract({
            contractId,
            hash
        });
        // save to data base
        await contractHash.save();

        // create new instance of smart contract
        const contract = new web3.eth.Contract(abi);
        const deploy = contract.deploy({ data: '0x' + bytecode, arguments: [contractHash.hash, signedByOwner, signedByRenter] });

        // Creating a signing account from a private key
        web3.eth.accounts.wallet.add(signer);
        // Send contract deployment transaction
        // const accounts = await web3.eth.getAccounts();
        // const result = await deploy.send({ from: accounts[0], gas: 1500000 });
        const result = await deploy.send({ from: signer.address, gas: 1500000 });

        return {
            contractAddress: result.options.address
        };
    }



}
module.exports = RentalContract;