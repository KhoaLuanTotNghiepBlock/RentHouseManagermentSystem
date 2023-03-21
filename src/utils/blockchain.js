const ethers = require('ethers');

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
module.exports = _this;