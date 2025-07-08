const Purchase = require('../models/Purchase');
const Ingredient = require('../models/Ingredient');
const {convertToGrams} = require("../queries/unitConversionService")


// Function to find all purchases
const findAllPurchases = async () => {
    try {
        const purchases = await Purchase.find().populate('ingredientId', 'name').sort({ purchaseDate: -1 });
        return purchases;
    } catch (e) {
        throw new Error('Error creating purchase:'+ e.message)
    }
}

const createPurchaseAndUpdateIngredient = async (purchaseData) => {
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

    const totalGrams = await convertToGrams(quantityPurchased, purchaseUnit);
    const pricePerGram = price / totalGrams;

    // Check if the result is a valid number before assigning it
    if (isNaN(pricePerGram) || !isFinite(pricePerGram)) {
        throw new Error(`Calculation resulted in an invalid number: ${pricePerGram}. Check inputs.`, 400);
    }

    // Assign the new values
    ingredient.latestPricePerGram = pricePerGram;
    ingredient.lastUpdated = purchase.purchaseDate || new Date();
    // Final save attempt
    await ingredient.save();
    return { purchase };
  } catch (e) {
      // This will now catch ANY error from the block above and log it clearly.
      console.error('--- FATAL ERROR in createPurchaseAndUpdateIngredient ---');
      console.error(e);
  }
}

module.exports = {
    findAllPurchases,
    createPurchaseAndUpdateIngredient
};