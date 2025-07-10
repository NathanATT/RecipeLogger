const express = require('express');
const router = express.Router();
const purchaseController = require('../controller/purchaseController')

// get all purchases
router.get('/', purchaseController.getAndManagePurchases);

// log new purchase
router.post('/', purchaseController.logNewPurchase);



module.exports = router