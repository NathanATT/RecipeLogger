const express = require('express');
const router = express.Router();
const purchaseController = require('../controller/purchaseController.js')

// get all purchases
router.get('/', purchaseController.getAllPurchases);

// log new purchase
router.post('/', purchaseController.logNewPurchase);

module.exports = router