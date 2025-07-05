const express = require('express');
const router = express.Router();
const purchaseController = require()

// get all purchases
router.get('/', purchaseController.getAllPurchases);

// log new purchase
router.post('/', purchaseController.logNewPurchase);

module.exports = router