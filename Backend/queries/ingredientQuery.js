const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Function to find all ingredients
const findAllIngredients = async () => {
    try {
        const ingredients = await Ingredient.find().sort({ name: 1 });
        return ingredients;
    } catch (error) {
        throw new AppError('Error fetching ingredients', 500);
    }
}

// Function to find an ingredient by its ID
const findIngredientById = async (ingredientId) => {
    try {
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            throw new AppError('Ingredient not found', 404);
        }
        return ingredient;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error fetching ingredient', 500);
    }
}

// Function to create a new ingredient
const createIngredient = async (ingredientData) => {
    try {
        const ingredient = new Ingredient(ingredientData);
        await ingredient.save();
        return ingredient;
    } catch (error) {
        // Handle MongoDB's duplicate key error (code 11000)
        if (error.code === 11000) {
            throw new AppError('An ingredient with this name already exists.', 409); // 409 Conflict
        }
        // Re-throw other errors
        throw error;
    }
}

// Function to update an ingredient
const updateIngredient = async (ingredientId, ingredientData) => {
    try {
        const updatedIngredient = await Ingredient.findByIdAndUpdate(ingredientId, ingredientData, { new: true, runValidators: true });
        if (!updatedIngredient) {
            throw new AppError('Ingredient not found', 404);
        }
        return updatedIngredient;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error updating ingredient', 500);
    }
}

// Function to delete an ingredient
const deleteIngredient = async (ingredientId) => {
    try {

        // Check if the ingredient is used in any recipes
        const recipesUsingIngredient = await Recipe.find({ ingredients: { $elemMatch: { ingredientId } } });
        if (recipesUsingIngredient.length > 0) {
            throw new AppError('Cannot delete ingredient as it is used in one or more recipes.', 400);
        }

        // Proceed to delete the ingredient
        const ingredient = await Ingredient.findByIdAndDelete(ingredientId);
        if (!ingredient) {
            throw new AppError('Ingredient not found', 404);
        }

        return ingredient;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom errors
        }
        throw new AppError('Error deleting ingredient', 500);
    }
}

// Function to find or create an ingredient 
const findOrCreateIngredient = async (name) => {
    const ingredientName = name.trim();
    if (!ingredientName) {
        throw new AppError('Ingredient name cannot be empty', 400)
    }

    const existingIngredient = await Ingredient.findOne({
        name: { $regex: new RegExp(`^${ingredientName}$`, 'i') }
    })

    if (existingIngredient){
        return existingIngredient
    }

    const newIngredient = new Ingredient({name: ingredientName});
    await newIngredient.save();
    return newIngredient;
}

module.exports = {
    findAllIngredients,
    findIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    findOrCreateIngredient
};