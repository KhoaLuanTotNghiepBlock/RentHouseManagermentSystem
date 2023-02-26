// Require necessary dependencies
const Web3 = require('web3');
require('dotenv').config();

const NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
// const { abi, bytecode } = JSON.parse(fs.readFileSync("Demo.json"));

// Set up Web3 provider
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`
        // `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
    )
);

// Creating a signing account from a private key
const signer = web3.eth.accounts.privateKeyToAccount(
    SIGNER_PRIVATE_KEY
);

module.exports = { web3, signer };

