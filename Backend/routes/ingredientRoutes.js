const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');


// Get all ingredients
router.get('/', ingredientController.getAllIngredients);

// Create a new master ingredient
router.post('/', ingredientController.createIngredient);

// Get a single ingredient by its ID
router.get('/:id', ingredientController.getIngredientById);

// Update an ingredient's details
router.put('/:id', ingredientController.updateIngredient);

// Delete an ingredient
router.delete('/:id', ingredientController.deleteIngredient);


module.exports = router;