// Require necessary dependencies
const Web3 = require("web3");
require("dotenv").config();

const NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
// Initialize web3 provider
const providerUrl = `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`;
// const providerUrl = `https://avalanche-fuji.infura.io/v3/167c12d457c54c0ea6cb0bd17a0e73dd`;
const provider = new Web3.providers.HttpProvider(providerUrl);

// Initialize web3 instance
const web3 = new Web3(provider);

module.exports = web3;
