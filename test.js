const { Contract, ethers, Wallet } = require("ethers");

class Web3Services {
  // ... existing methods ...

  /**
   * Sends a transaction to a specified contract.
   *
   * @param {Object} transaction - The transaction object.
   * @param {string} transaction.rpc - The RPC URL.
   * @param {string} transaction.privateKey - The private key for the signer.
   * @param {string} transaction.contractAddress - The address of the contract.
   * @param {Array} transaction.abi - The ABI of the contract.
   * @param {string} transaction.methodName - The contract method to call.
   * @param {Array} transaction.params - Parameters for the contract method.
   * @returns {Promise<Object>} The transaction receipt.
   */
  static async sendTransaction(transaction) {
    const { rpc, privateKey, contractAddress, abi, methodName, params } =
      transaction;
    try {
      // Create provider and signer
      const provider = Web3Services.createWeb3Provider(rpc);
      const signer = new Wallet(privateKey, provider);

      // Create contract instance with signer
      const contract = new Contract(contractAddress, abi, signer);

      // Send transaction to the contract
      const txResponse = await contract[methodName](...params);

      // Wait for the transaction to be mined
      return await txResponse.wait();
    } catch (error) {
      console.error({ name: "error sending transaction", transaction, error });
      throw error;
    }
  }
}

module.exports = Web3Services;
