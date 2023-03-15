// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentalContract {
    string public contractTransactionId;
    bool public signedByOwner;
    bool public signedByRenter;
    uint public rentAmount;
    uint public depositAmount;
    address payable public owner;
    address payable public renter;
    
    event RentStarted(address owner, uint rentAmount, uint depositAmount);
    event RentEnded(address renter, uint depositReturned);

    constructor(string memory _contractTransactionId,address payable _owner,address payable _renter, uint _rentAmount, uint _depositAmount){
        contractTransactionId = _contractTransactionId;
        owner = _owner;
        renter = _renter;
        rentAmount = _rentAmount;
        depositAmount = _depositAmount;
    }

    function signByOwner() public {
        require(msg.sender == owner, "Only owner can sign the contract");
        signedByOwner = true;
    }

    function signByRenter() public payable{
        signedByRenter = true;
        emit RentStarted(renter, rentAmount, depositAmount);
    }

     function endRent() public {
        owner.transfer(rentAmount + depositAmount);
        emit RentEnded(msg.sender, depositAmount);
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function getContractTransactionId() public view returns (string memory) {
            return contractTransactionId;
    }

}
