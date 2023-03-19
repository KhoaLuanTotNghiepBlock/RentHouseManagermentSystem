require('dotenv').config();
const { Contract, ethers, Wallet } = require("ethers");
const NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_API_KEY = process.env.INFURA_API_KEY;

class Web3Services {
    static createWeb3Provider(rpc) {
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        return provider;
    }

    static createSigner(provider, privateKey) {
        const signer = new Wallet(privateKey, provider);
        return signer;
    }

    static createContract(signer, address, abi) {
        const contract = new Contract(address, abi, signer);
        return contract;
    }

    static async fetchData({ rpc, retry = null, delay = 1000, contractAddress = null, abi = null, nameFunction = null, params = [], providerMethod = null }) {
        return new Promise(async (resolve) => {
            const query = { rpc, retry, contractAddress, abi, nameFunction, params, providerMethod };
            try {
                const provider = Web3Services.createWeb3Provider(rpc);
                if (providerMethod) {
                    const result = await provider[providerMethod](...params);
                    resolve(result);
                } else if (contractAddress && abi && nameFunction) {
                    const contract = new Contract(contractAddress, abi, provider);
                    const result = await contract[nameFunction](...params);
                    resolve(result);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error({ name: "error fetch data", query, error, retry });
                if (retry && retry > 0) {
                    setTimeout(
                        () =>
                            resolve(
                                Web3Services.fetchData({
                                    ...query,
                                    retry: retry - 1,
                                })
                            ),
                        delay
                    );
                } else {
                    resolve(null);
                }
            }
        });
    }

    static async getTransaction({ hash, rpc }) {
        const result = await Web3Services.fetchData({
            rpc,
            params: [hash],
            providerMethod: "getTransaction",
            retry: 10,
        });
        return result;
    }

    // Nonce / retry / delay: only use in retry sendTransaction
    static async sendTransaction({ rpc, privateKey, contractAddress, abi, functionName, value, params = [], waitSuccess = false, nonce = null, retry = null, delay = 1000 }) {
        return new Promise(async (resolve) => {
            const payload = { rpc, privateKey, contractAddress, abi, functionName, value, params, waitSuccess, retry };
            const provider = Web3Services.createWeb3Provider(rpc);
            const signer = Web3Services.createSigner(provider, privateKey);
            const contract = Web3Services.createContract(signer, contractAddress, abi);
            try {
                const txPending = await contract[functionName](...params, {
                    value,
                    nonce: nonce || undefined,
                });

                if (waitSuccess) {
                    await txPending.wait();
                }

                resolve({
                    hash: txPending.hash,
                    from: txPending.from,
                    value: `${txPending.value}`,
                    to: txPending.to,
                    data: txPending.data,
                    nonce: txPending.nonce,
                });
            } catch (error) {
                console.log(error);
                if (retry && retry > 0) {
                    console.log(`Retry send tx ${retry}`, payload);
                    setTimeout(async () => {
                        resolve(
                            Web3Services.sendTransaction({
                                ...payload,
                                nonce: (await Web3Services.getNonce({ rpc, address: signer.address })) || undefined,
                                retry: retry - 1,
                            })
                        );
                    }, delay);
                } else {
                    resolve(null);
                }
            }
        });
    }
}

module.exports = Web3Services;