const router = require('express').Router();
const contractController = require('../controller/contract.controller');


router.post('/create-contract', contractController.createContract);
router.post('/create-smart-contract', contractController.createSmartContract);

router.get('/:renterId', contractController.getContractByRenter);

module.exports = router; 