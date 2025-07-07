const Purchase = require('../models/Purchase');
const Ingredient = require('../models/Ingredient');

// Error handling for the purchase query
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}


// Function to find all purchases
const findAllPurchases = async () => {
    try {
        const purchases = await Purchase.find().populate('ingredientId', 'name').sort({ purchaseDate: -1 });
        return purchases;
    } catch (error) {
        throw new AppError('Error fetching purchases', 500);
    }
}

// Function to create a purchase and update the ingredient
const createPurchaseAndUpdateIngredient = async(purchaseData) => {
    try { 
        const { ingredientId, quantityPurchased, purchaseUnit, price } = purchaseData;
        if (!ingredientId || !quantityPurchased || !purchaseUnit || !price) {
            throw new AppError('All fields are required', 400);
        }

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            throw new AppError('Ingredient not found', 404);
        }

        const purchase = new Purchase(purchaseData);
        await purchase.save();

        // Update the ingredient's latest price per unit
        const pricePerStandardUnit = price / quantityPurchased;

        ingredient.latestPricePerUnit = pricePerStandardUnit;
        ingredient.lastUpdated = new Date() || purchase.purchaseDate;
        await ingredient.save();

        return { purchase };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        } else {
            throw new AppError('Error creating purchase', 500);
        }
    }
}

module.exports = {
    findAllPurchases,
    createPurchaseAndUpdateIngredient
};