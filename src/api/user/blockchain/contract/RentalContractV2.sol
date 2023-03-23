// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentalContract {
    struct Room {
        string contractHash;
        string invoiceHash;
        uint256 rentAmountPerMonth;
        uint256 depositAmount;
        address payable owner;
        address payable renter;
        bool signed;
        bool forRent;
    }

    uint256 public roomId;
    mapping(uint256 => Room) public rooms;

    event SetRoomForRent(uint256 _roomId);
    event RentStarted(uint256 _roomId, address renter, string _contractHash);
    event PayForRent(uint256 _roomId, string _invoiceHash);
    event RentEnded(uint256 _roomId);
    event ReOpen(uint256 _roomId);

    function setRoomForRent(
        uint256 rentAmountPerMonth,
        uint256 depositAmount
    ) public {
        rooms[roomId] = Room(
            "",
            "contract",
            rentAmountPerMonth,
            depositAmount,
            payable(msg.sender),
            payable(address(0)),
            false,
            true
        );
        emit SetRoomForRent(roomId);
        roomId++;
    }

    function signByRenter(uint256 _roomId,  string memory _contractHash) public payable {
        require(rooms[_roomId].forRent, "!for rent");
        require(
            msg.value >=
                rooms[_roomId].rentAmountPerMonth +
                    rooms[_roomId].depositAmount,
            "!balance"
        );
        require(!rooms[_roomId].signed, "Room rented");
        rooms[_roomId].signed = true;
        rooms[_roomId].renter = payable(msg.sender);
        rooms[_roomId].contractHash = _contractHash;
        rooms[_roomId].owner.transfer(rooms[_roomId].rentAmountPerMonth);
        emit RentStarted(_roomId, msg.sender, rooms[_roomId].contractHash);
    }

    function payForRentByMonth(
        uint256 _roomId,
        string memory _invoiceHash
    ) public payable {
        require(rooms[_roomId].forRent, "!for rent");
        require(rooms[_roomId].renter == payable(msg.sender), "!renter");
        require(msg.value >= rooms[_roomId].rentAmountPerMonth, "!balance");
        rooms[_roomId].invoiceHash = _invoiceHash;
        rooms[_roomId].owner.transfer(rooms[_roomId].rentAmountPerMonth);
        emit PayForRent(_roomId, _invoiceHash);
    }

    function endRent(uint256 _roomId) public {
        require(rooms[_roomId].forRent, "!for rent");
        require(rooms[_roomId].owner == payable(msg.sender), "!owner");
        rooms[_roomId].renter.transfer(rooms[_roomId].depositAmount);
        rooms[_roomId] = Room(
            "",
            "",
            0,
            0,
            payable(rooms[_roomId].owner),
            payable(address(0)),
            false,
            false
        );
        emit RentEnded(_roomId);
    }

    function reOpenRoomForRent(
        uint256 _roomId,
        string memory contractHash,
        uint256 rentAmountPerMonth,
        uint256 depositAmount
    ) public {
        require(rooms[_roomId].owner == payable(msg.sender), "!owner");
        rooms[_roomId] = Room(
            contractHash,
            "",
            rentAmountPerMonth,
            depositAmount,
            payable(msg.sender),
            payable(address(0)),
            false,
            true
        );
        emit ReOpen(_roomId);
    }
}
