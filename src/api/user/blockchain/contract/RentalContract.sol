// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentalContract {
    string public contractTransactionId;
    bool public signedByOwner;
    bool public signedByRenter;

   function setContractTransactionId(string memory _contractTransactionId) public {
        contractTransactionId = _contractTransactionId;
    }

    function getContractTransactionId() public view returns (string memory) {
            return contractTransactionId;
    }

}
