const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const mongoose = require('mongoose');
const { convertToGrams } = require('../queries/unitConversionService')
const { findOrCreateIngredient } = require('./ingredientQuery')

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
const deleteRecipeById = async (recipeId) => {
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

// Function to calculate recipe cost 
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

/**
 * Creates a recipe from a payload where ingredients are specified by name.
 * It finds or creates ingredients as needed.
 * @param {object} recipeData - Recipe data with a text-based ingredient list.
 * @returns {Promise<Object>} The newly created recipe document.
 */
const createRecipeFromText = async (recipeData) => {
  const { recipeName, ingredients: textIngredients, ...rest } = recipeData;

  if (!recipeName || !textIngredients || !Array.isArray(textIngredients)) {
    throw new AppError('Recipe name and an ingredients array are required.', 400);
  }

  // Process each text ingredient to get a valid ingredient sub-document
  const processedIngredients = await Promise.all(
    textIngredients.map(async (ing) => {
      const ingredientDoc = await findOrCreateIngredient(ing.name);
      return {
        ingredientId: ingredientDoc._id,
        ingredientName: ingredientDoc.name, 
        amount: ing.amount,
        unit: ing.unit,
      };
    })
  );

  const newRecipe = new Recipe({
    recipeName,
    ingredients: processedIngredients,
    ...rest,
  });

  await newRecipe.save();
  return newRecipe;
};

module.exports = {
    findAllRecipes,
    findRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipeById,
    calculateRecipeCost,
    createRecipeFromText
};