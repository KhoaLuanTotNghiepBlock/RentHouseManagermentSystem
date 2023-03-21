// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentalContract {
    string public contractTransactionId;
    string public invoiceId;
    bool public signedByOwner;
    bool public signedByRenter;
    uint public rentAmount;
    uint public depositAmount;
    address payable public owner;
    address payable public renter;

    event RentStarted(address renter, uint rentAmount, uint depositAmount);
    event RentMonth(address renter, uint rentAmount);
    event RentEnded(address owner, uint depositReturned);

    constructor(
        string memory _contractTransactionId,
        address payable _owner,
        address payable _renter,
        uint _rentAmount,
        uint _depositAmount
    ) {
        contractTransactionId = _contractTransactionId;
        owner = _owner;
        renter = _renter;
        rentAmount = _rentAmount;
        depositAmount = _depositAmount;
        signedByOwner= true;
    }

    // only renter cna sign
    function signByRenter() public payable {
        signedByRenter = true;
        require(msg.value >= rentAmount + depositAmount, "!balance");
        emit RentStarted(renter, rentAmount, depositAmount);
        owner.transfer(rentAmount);
    }

    // TODO: payment by month
    function payForRentByMonth(string memory _invoiceId) public payable {
        require(msg.value >= rentAmount, "!balance");
        emit RentMonth(renter, rentAmount);
        owner.transfer(rentAmount);
        invoiceId = _invoiceId;
    }

    // TODO: only owner can call
    function endRent(string memory _contractTransactionId) public {
        renter.transfer(depositAmount);
        contractTransactionId = _contractTransactionId;
        emit RentEnded(msg.sender, depositAmount);
    }

    function getContractTransactionId() public view returns (string memory) {
        return contractTransactionId;
    }
}
