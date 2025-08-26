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
const updateRecipe = async (id, updateData) => {
  // Find the recipe first to ensure it exists.
  const recipeToUpdate = await Recipe.findById(id);
  if (!recipeToUpdate) {
    throw new AppError('Recipe not found.', 404);
  }
  const processedGroups = await processTextIngredients(updateData.ingredients);

  recipeToUpdate.set({
    ...updateData,
    ingredientGroups: processedGroups,
    ingredients: undefined,
  });
  
  await recipeToUpdate.save();
  return recipeToUpdate;
};

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
  const processedGroups = await processTextIngredients(recipeData.ingredients);

  const newRecipe = new Recipe({
    ...recipeData,
    ingredientGroups: processedGroups,
    ingredients: undefined // Ensure the old field is not saved
  });

  await newRecipe.save();
  return newRecipe;
};

/**
 * Takes a text-based ingredient list and resolves it into a structured
 * list with valid ingredient IDs by finding or creating each ingredient.
 * This is the core shared logic.
 * @param {Array<object>} textIngredients - Array of {name, amount, unit}.
 * @returns {Promise<Array<object>>} The processed ingredients array.
 */
const processTextIngredients = async (textIngredients) => {
  if (!textIngredients || !Array.isArray(textIngredients)) {
    throw new AppError('An ingredients array is required.', 400);
  }

  // Use a map to build the groups
  const groups = new Map();
  let currentGroupName = 'Main'; // Default group if none is specified first

  for (const ing of textIngredients) {
    // If the ingredient has a groupName, switch the current group
    if (ing.isGroupHeader) {
      currentGroupName = ing.name;
      continue; // Move to the next line
    }

    // If the current group doesn't exist in our map yet, create it
    if (!groups.has(currentGroupName)) {
      groups.set(currentGroupName, {
        groupName: currentGroupName,
        ingredients: [],
      });
    }

    // Find or create the ingredient document
    const ingredientDoc = await findOrCreateIngredient(ing.name);

    // Add the processed ingredient to the current group's ingredient list
    groups.get(currentGroupName).ingredients.push({
      ingredientId: ingredientDoc._id,
      ingredientName: ingredientDoc.name,
      amount: ing.amount,
      unit: ing.unit,
    });
  }

  // Convert the map values to an array
  return Array.from(groups.values());
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