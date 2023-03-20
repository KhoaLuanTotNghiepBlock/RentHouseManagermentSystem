const { Chain, Config } = require("../database/models");
const CheckBlockChainLog = require("./logs");
const Chains = [
    {
        "chainId": "5",
        "name": "goerli",
        "rpcs": ["https://goerli.infura.io/v3/167c12d457c54c0ea6cb0bd17a0e73dd"],
        "percentGasPrice": 1,
        "type": 0
    },
    {
        "chainId": "11155111",
        "name": "sepolia",
        "rpcs": ["https://sepolia.infura.io/v3/167c12d457c54c0ea6cb0bd17a0e73dd"],
        "percentGasPrice": 1,
        "type": 0
    },
];

(async () => {
    const [chains, contracts] = await Promise.all([
        Chain.find({ isDeleted: false, isProcessedLog: true }).lean(),
        Config.findOne({ key: "contract" }).lean(),
    ]);
    Object.keys(contracts.values).forEach((key) => {
        contracts.values[key] = contracts.values[key].toLowerCase();
    });
    for (const chain of chains) {
        new CheckBlockChainLog(chain, contracts.values).start();
    }
})();
