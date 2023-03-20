// Require necessary dependencies
const Web3 = require('web3');
const { Contract, ethers, Wallet } = require("ethers");
require('dotenv').config();

const NETWORK = process.env.ETHEREUM_NETWORK;
// const NETWORK = "sepolia";
const INFURA_API_KEY = process.env.INFURA_API_KEY;
// const { abi, bytecode } = JSON.parse(fs.readFileSync("Demo.json"));
// Initialize web3 provider
// const providerUrl = `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`;
const providerUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
const provider = new Web3.providers.HttpProvider(providerUrl);

// Initialize web3 instance
const web3 = new Web3(provider);
// Set up Web3 provider
// const web3 = new Web3(
//     new Web3.providers.HttpProvider(
//         `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`
//     )
// );

module.exports = web3;

