const ethers = require('ethers');
const axios = require('axios');

const JSON_PROVIDER = new ethers.providers.JsonRpcProvider();
const _this = {};

_this.rentHouseContract = initContract(
    ethers.constants.AddressZero,
    require("../api/user/blockchain/contract/RentalContract.json")
);

_this.eventTopicBugHouse = {
    RentStarted: _this.rentHouseContract.filters.RentStarted().topics[0],
    RentEnded: _this.rentHouseContract.filters.RentEnded().topics[0]
}
_this.getLatestBlockNumber = async (
    rpc,
    chainId,
    delay = 1000,
    maxTime = 10,
    repeat = 0
) => {
    try {
        const JSON_PROVIDER = new ethers.providers.JsonRpcProvider(rpc, {
            chainId: parseInt(chainId),
        });
        const blockNumber = await JSON_PROVIDER.getBlockNumber();
        return blockNumber - 10;
    } catch (e) {
        console.error(e);
        console.error("getLatestBlockNumber error", e.message);

        if (repeat < maxTime) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    return resolve(
                        _this.getLatestBlockNumber(chainId, delay, maxTime, repeat + 1)
                    );
                }, delay);
            });
        }

        console.error("getLatestBlockNumber error with maximum retry", e.message);
        throw e;
    }
};

_this.vndToEth = async (vndAmount) => {
    const [usdRateResponse, ethRateResponse] = await Promise.all([
        axios.get('https://api.coinbase.com/v2/exchange-rates?currency=VND'),
        axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH')
    ]);
    const usdRate = usdRateResponse.data.data.rates.USD;
    const ethRate = ethRateResponse.data.data.rates.USD;

    const usdAmount = vndAmount * usdRate;
    const ethAmount = usdAmount / ethRate;
    return ethAmount;
};
module.exports = _this;