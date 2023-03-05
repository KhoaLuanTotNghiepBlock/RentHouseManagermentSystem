// Require necessary dependencies
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config();

const NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
// const { abi, bytecode } = JSON.parse(fs.readFileSync("Demo.json"));

// Set up Web3 provider
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`
    )
);


module.exports = web3;

