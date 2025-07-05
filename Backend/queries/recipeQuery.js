const Recipe = require('../models/recipeModel');
const Ingredient = require('../models/ingredientModel');
const mongoose = require('mongoose');

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

// Function to calculate the total cost of a recipe
const calculateRecipeCost = async (recipeId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            throw new AppError('Invalid recipe ID format.', 400);
        }

        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId.isValid(recipeId)}},

            {$unwind: '$ingredients'},

            {
                $lookup: {
                    from: 'ingredients',
                    localField: 'ingredients.ingredientId',
                    foreignField: '_id',
                    as: 'ingredientDetails'
                }
            },

            { $unwind: '$ingredientDetails' },
            
        ]
    } catch (error) {
        throw new AppError('Error calculating recipe cost', 500);
    }
}