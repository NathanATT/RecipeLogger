const recipeQuery = require('../queries/recipeQueries');

module.exports = {
    getAllRecipes: async (req, res) => {
        try {
            const recipes = await recipeQuery.findAllRecipes();
            res.status(200).json(recipes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching recipes.', error: error.message });
        }
    },
    createRecipe: async (req, res) => {
        try {
            const recipeData = req.body;
            const result = await recipeQuery.createRecipe(recipeData);
            res.status(201).json({
                message: 'Recipe created successfully',
                data: result
            });
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: 'Error creating recipe.', error: error.message });
        }
    },
    getRecipeById: async (req, res) => {
        try {
            const recipeId = req.params.id;
            const recipe = await recipeQuery.findRecipeById(recipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found.' });
            }
            res.status(200).json(recipe);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching recipe.', error: error.message });
        }
    },
    getRecipeCost: async (req, res) => {
        try {
            const recipeId = req.params.id;
            const costDetails = await recipeQuery.calculateRecipeCost(recipeId);
            if (costDetails === null) {
                return res.status(404).json({ message: 'Recipe not found or no ingredients available.' });
            }
            res.status(200).json(costDetails);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating recipe cost.', error: error.message });
        }
    },
    updateRecipe: async (req, res) => {
        try {
            const recipeId = req.params.id;
            const recipeData = req.body;
            const updatedRecipe = await recipeQuery.updateRecipe(recipeId, recipeData);
            if (!updatedRecipe) {
                return res.status(404).json({ message: 'Recipe not found.' });
            }
            res.status(200).json({
                message: 'Recipe updated successfully',
                data: updatedRecipe
            });
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: 'Error updating recipe.', error: error.message });
        }
    },
    deleteRecipe: async (req, res) => {
        try {
            const deletedRecipe = await recipeQuery.deleteRecipeById(req.params.id);
            if (!deletedRecipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
            res.status(200).json({ message: 'Recipe deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
}