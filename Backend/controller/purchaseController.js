const purchaseQuery = require('../queries/purchaseQuery.js');

module.exports = {
    getAllPurchases : async (req, res) => {
        try {
            const purchases = await purchaseQuery.findAllPurchases();
            res.status(200).json(purchases);
        } catch (error) {
            res.status(500).json({message: 'Error fetchiing purchases.', error: error.message})
        }
    },
    logNewPurchase : async (req, res) => {
        try {
            const purchaseData = req.body;
            const result = await purchaseQuery.createPurchaseAndUpdateIngredient(purchaseData);
            res.status(201).json({
                message: 'Purchase logged successfully', data: result
            });
        } catch (error) {
            res.status(error.statusCode || 500).json({message: 'Error logging purchase.', error: error.message});
        }
    },
    managePurchases : async (req, res) => {
        try {
            const query = req.query;
            const result = await purchaseQuery.findAndManagePurchases(query);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({message: 'Error managing purchases.', error: error.message});
        }
    }
}