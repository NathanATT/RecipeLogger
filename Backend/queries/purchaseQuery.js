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

/**
 * Finds all purchases with advanced filtering, sorting, and pagination.
 * @param {object} query - The query parameters from the request (e.g., req.query).
 */
const findAndManagePurchases = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "purchaseDate",
        order = "desc",
        search = "",
        startDate,
        endDate,
    } = query;

    const filter = {};

    if (search) {
        const ingredients = await Ingredient.find({
        name: { $regex: search, $options: "i" },
        }).select("_id");

        const ingredientIds = ingredients.map((ing) => ing._id);

        if (ingredientIds.length === 0) {
        return {
            purchases: [],
            totalPages: 0,
            currentPage: 1,
        };
        }

        filter.ingredientId = { $in: ingredientIds };
    }

    if (startDate || endDate) {
        filter.purchaseDate = {};
        if (startDate) filter.purchaseDate.$gte = new Date(startDate);
        if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    if (sortBy === "ingredientId.name") {
        sortOptions["purchaseDate"] = order === "asc" ? 1 : -1;
    } else {
        sortOptions[sortBy] = order === "asc" ? 1 : -1;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const purchases = await Purchase.find(filter)
        .populate("ingredientId", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(); // Use .lean() for faster read-only queries

    const totalPurchases = await Purchase.countDocuments(filter);

    return {
        purchases,
        totalPages: Math.ceil(totalPurchases / limit),
        currentPage: parseInt(page, 10),
    };
};


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
      console.error('--- FATAL ERROR in createPurchaseAndUpdateIngredient ---');
      console.error(e);
  }
}

module.exports = {
    findAllPurchases,
    createPurchaseAndUpdateIngredient,
    findAndManagePurchases
};