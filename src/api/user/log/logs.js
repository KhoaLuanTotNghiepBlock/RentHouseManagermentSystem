const ethers = require("ethers");
const web3 = require('../blockchain/config/web3-init');
const { rentHouseContract, eventTopicBugHouse, getLatestBlockNumber } = require('../../../utils/blockchain');
const processLog = require('../blockchain/contract/process-log');

const CHECK_BLOCK_TIMEOUT = 3000;
const BLOCK_LIMIT = 1000;

class LogChecker {
    watchAddresses = [];
    watchTopics = [
        [
            eventTopicBugHouse.RentStarted,
            eventTopicBugHouse.RentEnded
        ],
    ];

    constructor(chain, contracts, blockTime = 3000) {
        this.chainId = chain.chainId;
        this.rpcs = chain.rpcs;
        this.minBlock = Number(chain.minBlock);
        this.chainName = chain.name;
        this.currentBlock = Number(chain.currentBlock);
        this.contracts = contracts;
        this.watchAddresses = [contracts.rentHouse];

        this.blockTime = blockTime;
    }

    async start() {
        console.log(
            `START CHECK BLOCK on ${this.chainName.toUpperCase()} : ${this.chainId}`
        );
        let currentBlock = this.currentBlock;
        try {
            const config = await ChainModel.findOne({ chainId: this.chainId }).lean();
            if (!currentBlock) {
                if (config?.currentBlock) {
                    currentBlock = config.currentBlock;
                } else {
                    currentBlock = await getLatestBlockNumber(
                        this.getRandomRPC(),
                        this.chainId
                    );
                    currentBlock = Math.max(currentBlock, this.minBlock);
                }
                await this.updateCurrentBlock(currentBlock);
            }

            let latestBlock = await getLatestBlockNumber(
                this.getRandomRPC(),
                this.chainId
            );
            latestBlock = Math.max(latestBlock, this.minBlock);
            if (latestBlock !== currentBlock) {
                const lessBlock = Math.min(currentBlock + 1, latestBlock);
                const gtBlock = Math.max(currentBlock + 1, latestBlock);
                await this.processBlock(lessBlock, gtBlock);
                await this.updateCurrentBlock(gtBlock);
            }
            this.currentBlock = latestBlock;

            setTimeout(() => {
                this.start();
            }, parseInt(CHECK_BLOCK_TIMEOUT));
        } catch (e) {
            console.error("runCheckBlock error", e.message);
            console.error(e);

            setTimeout(() => {
                this.start();
            }, parseInt(CHECK_BLOCK_TIMEOUT));
        }
    }

    async processBlock(startBlock, endBlock) {
        let events = [];
        let retry = 0;
        do {
            if (retry >= 2) {
                events = [];
                break;
            }
            events = await this.getPastLogs(startBlock, endBlock);
            retry += 1;
        } while (!events.length);

        for (let i = 0; i < events.length; i += 1) {
            const event = events[i];
            const eventAddress = ethers.utils.getAddress(event.address).toLowerCase();
            switch (eventAddress) {
                case this.contracts.rentHouse:
                    await processLog(event, this.chainId);
                    break;
            }
        }
    }

    async getPastLogs(fromBlock, toBlock) {
        let logs = [];
        for (
            fromBlock;
            fromBlock <= toBlock;
            fromBlock = fromBlock + BLOCK_LIMIT + 1
        ) {
            const endBlock =
                fromBlock + BLOCK_LIMIT <= toBlock ? fromBlock + BLOCK_LIMIT : toBlock;
            console.log(
                "getting block...",
                this.chainName.toUpperCase(),
                "from",
                fromBlock,
                "to",
                endBlock
            );
            const events = await this.getLogs(fromBlock, endBlock);
            if (events.length) {
                logs = logs.concat(events);
            }
        }
        return logs;
    }

    async getLogs(fromBlock, toBlock, delay = 1000, maxTime = 10, repeat = 0) {
        const rpc = this.getRandomRPC();
        const web3 = await getWeb3(rpc);
        return web3.eth
            .getPastLogs({
                address: this.watchAddresses,
                fromBlock,
                toBlock,
                topics: this.watchTopics,
            })
            .then((res) => {
                if (res) return res;
                if (repeat < maxTime) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            return resolve(
                                this.getLogs(fromBlock, toBlock, delay, maxTime, ++repeat)
                            );
                        }, delay);
                    });
                }
                return [];
            })
            .catch((e) => {
                console.log("getLogs err", e);
                if (repeat < maxTime) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            console.log("retry log", fromBlock, toBlock);
                            return resolve(
                                this.getLogs(fromBlock, toBlock, delay, maxTime, ++repeat)
                            );
                        }, delay);
                    });
                }
                return [];
            });
    }
    // UTILS METHODS

    async updateCurrentBlock(blockNumber) {
        await ChainModel.updateOne(
            { chainId: this.chainId },
            { currentBlock: blockNumber, lastUpdateBlockAt: new Date() },
            { upsert: true }
        );
    }

    getRandomRPC() {
        const rpc = this.rpcs.length
            ? this.rpcs[Math.floor(Math.random() * this.rpcs.length)]
            : null;
        return rpc;
    }
};

module.exports = LogChecker;