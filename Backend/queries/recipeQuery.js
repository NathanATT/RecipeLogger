const Recipe = require('../models/recipeModel');
const Ingredient = require('../models/ingredientModel');
const mongoose = require('mongoose');
const { convertToGrams } = require('../models/conversionSetting')

// custom error handler
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Function to find all recipes
const findAllRecipes = async () => {
    try {
        const recipes = await Recipe.find().select('recipeName description servings');
        return recipes;
    } catch (error) {
        throw new AppError('Error fetching recipes', 500);
    }
}

// Function to find a recipe by its ID
const findRecipeById = async (recipeId) => {
    try {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }
        return recipe;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error fetching recipe', 500);
    }
}

// Function to create a new recipe
const createRecipe = async (recipeData) => {
    try {
        const recipe = new Recipe(recipeData);
        await recipe.save();
        return recipe;
    } catch (error) {
        // Handle MongoDB's duplicate key error (code 11000)
        if (error.code === 11000) {
            throw new AppError('A recipe with this name already exists.', 409); // 409 Conflict
        }
        // Re-throw other errors
        throw error;
    }
}

// Function to update a recipe
const updateRecipe = async (recipeId, recipeData) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, recipeData, { new: true, runValidators: true });
        if (!updatedRecipe) {
            throw new AppError('Recipe not found', 404);
        }
        return updatedRecipe;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error updating recipe', 500);
    }
}

// Function to delete a recipe
const deleteRecipe = async (recipeId) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
        if (!deletedRecipe) {
            throw new AppError('Recipe not found', 404);
        }
        return deletedRecipe;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error deleting recipe', 500);
    }
}

const calculateRecipeCost = async (recipeId) => {
    const recipe = await Recipe.findById(recipeId).lean(); // .lean() for performance
    if (!recipe) throw new AppError('Recipe not found.', 404);

    const ingredientIds = recipe.ingredients.map(ing => ing.ingredientId);
    const ingredientsData = await Ingredient.find({ '_id': { $in: ingredientIds } }).lean();
    const ingredientMap = new Map(ingredientsData.map(ing => [ing._id.toString(), ing]));

    let totalCost = 0;
    const ingredientCosts = [];

    await Promise.all(recipe.ingredients.map(async (recipeIngredient) => {
        const masterIngredient = ingredientMap.get(recipeIngredient.ingredientId.toString());
        if (!masterIngredient) throw new AppError(`Data for ingredient '${recipeIngredient.ingredientName}' not found.`, 404);

        try {
        // Use the service to convert the recipe amount to grams
        const amountInGrams = await convertToGrams(
            recipeIngredient.amount,
            recipeIngredient.unit
        );

        const cost = amountInGrams * masterIngredient.latestPricePerGram;
        
        // We lock here to prevent race conditions when updating shared variables
        totalCost += cost;
        ingredientCosts.push({
            name: recipeIngredient.ingredientName,
            cost,
        });

        } catch (error) {
        throw new AppError(`Could not calculate cost for ${masterIngredient.name}: ${error.message}`, 400);
        }
    }));

    return {
        _id: recipe._id,
        recipeName: recipe.recipeName,
        totalCost,
        ingredientCosts,
    };
};

module.exports = {
    findAllRecipes,
    findRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    calculateRecipeCost
};