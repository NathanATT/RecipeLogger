const ingredientQuery = require('../queries/ingredientQueries');

module.exports = {
    getAllIngredients: async (req, res) => {
        try {
            const ingredients = await ingredientQuery.findAllIngredients();
            res.status(200).json(ingredients);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching ingredients.', error: error.message });
        }
    },
    createIngredient: async (req, res) => {
        try {
            const ingredientData = req.body;
            const result = await ingredientQuery.createIngredient(ingredientData);
            res.status(201).json({
                message: 'Ingredient created successfully',
                data: result
            });
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: 'Error creating ingredient.', error: error.message });
        }
    },
    getIngredientById: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const ingredient = await ingredientQuery.findIngredientById(ingredientId);
            if (!ingredient) {
                return res.status(404).json({ message: 'Ingredient not found.' });
            }
            res.status(200).json(ingredient);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching ingredient.', error: error.message });
        }
    },
    updateIngredient: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const ingredientData = req.body;
            const updatedIngredient = await ingredientQuery.updateIngredient(ingredientId, ingredientData);
            if (!updatedIngredient) {
                return res.status(404).json({ message: 'Ingredient not found.' });
            }
            res.status(200).json({
                message: 'Ingredient updated successfully',
                data: updatedIngredient
            });
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: 'Error updating ingredient.', error: error.message });
        }
    },
    deleteIngredient: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const result = await ingredientQuery.deleteIngredient(ingredientId);
            if (!result) {
                return res.status(404).json({ message: 'Ingredient not found.' });
            }
            res.status(200).json({ message: 'Ingredient deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting ingredient.', error: error.message });
        }
    }
};

