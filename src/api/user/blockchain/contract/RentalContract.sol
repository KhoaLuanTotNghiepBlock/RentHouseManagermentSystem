// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentalContract {
    string public contractTransactionId;
    bool public signedByOwner;
    bool public signedByRenter;
    string public invoice;
    address public owner;
    address public renter;
    
    constructor(string memory _contractTransactionId,address _owner,address _renter){
        contractTransactionId = _contractTransactionId;
        owner = _owner;
        renter = _renter;
    }

    function signByOwner() public {
        require(msg.sender == owner, "Only owner can sign the contract");
        signedByOwner = true;
    }

    function signByRenter() public payable{
        signedByRenter = true;
    }

    function payForInvoice(string memory _invoice) public payable{
        require(msg.sender == renter, "Only renter can pay for the invoice");
        invoice = _invoice;
    }
    
    function getInvoice()public view returns (string memory){
        return invoice;
    }
    
    function getContractTransactionId() public view returns (string memory) {
            return contractTransactionId;
    }

}
