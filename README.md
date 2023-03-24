# entrance_test_nodejs_nexlesoft

## How to run 
`npm install || npm i`
<hr>
Run with role user: `npm run start-user`
Run with role admin: `npm run start-admin`

## API


### Rental house
<hr>
# user create account
# user create room => room will deploy on admin smart-contract with room-transaction 
# renter rent room by contract ==> create success reuturn { contract, contract hash}
# renter have to sign that aggree to rent room ==> 
# sign by renter contain {
    contractHash,
    roomInfo
} ==> sign transaction to room on smart contract renter have to pay rentAmount + rentDeposit
==> room info in smart contract will be update {contract, renter address, deposit}
==> user owner receive rentamount
