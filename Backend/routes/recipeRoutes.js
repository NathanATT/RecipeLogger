const express = require('express');
const router = express.Router();
const recipeController = require('../controller/recipeController');

// Get all recipes
router.get('/', recipeController.getAllRecipes);

// Create a new recipe
router.post('/', recipeController.createRecipe);

// Get a single recipe by its ID
router.get('/:id', recipeController.getRecipeById);

// Calculate the total cost of a single recipe
router.get('/:id/cost', recipeController.getRecipeCost);

// Update a recipe
router.put('/:id', recipeController.updateRecipe);

// Delete a recipe
router.delete('/:id', recipeController.deleteRecipe);

// Create a recipe from an ingredient list
router.post('/from-text', recipeController.createRecipeFromText)

module.exports = router;