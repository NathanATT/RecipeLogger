import React, { useState, useEffect,} from 'react';
import type {FormEvent } from 'react'
import * as api from '../api/apiService'; 
import type { Recipe, Ingredient, RecipeCost } from '../types';
import './RecipePage.css'; 
import { FaPlus, FaDollarSign, FaTimes,} from 'react-icons/fa'; 
import {Link} from 'react-router-dom'

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState<boolean>(false);
  const [selectedRecipeCost, setSelectedRecipeCost] = useState<RecipeCost | null>(null);

  // State for the "Create Recipe" form
  const [newRecipe, setNewRecipe] = useState({
    recipeName: '',
    description: '',
    instructions: '',
    ingredients: [{ ingredientId: '', ingredientName: '', amount: 0, unit: 'g' }]
  });

  // Fetch initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [recipesRes, ingredientsRes] = await Promise.all([
          api.getRecipes(),
          api.getIngredients()
        ]);
        setRecipes(recipesRes.data);
        setIngredients(ingredientsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  // --- Form Handlers for Create Recipe Modal ---

  const handleRecipeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const updatedIngredients = [...newRecipe.ingredients];
    if (field === 'ingredientId') {
        const selectedIng = ingredients.find(ing => ing._id === value);
        updatedIngredients[index] = {
            ...updatedIngredients[index],
            ingredientId: value,
            ingredientName: selectedIng ? selectedIng.name : ''
        };
    } else if (field === 'amount') {
        updatedIngredients[index] = { ...updatedIngredients[index], amount: parseFloat(value) || 0 };
    } else {
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    }
    setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredientField = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: '', ingredientName: '', amount: 0, unit: 'g' }]
    }));
  };

  const removeIngredientField = (index: number) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const handleCreateRecipeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
        await api.createRecipe(newRecipe);
        setIsCreateModalOpen(false);
        // Reset form and refetch recipes
        setNewRecipe({ recipeName: '', description: '', instructions: '', ingredients: [{ ingredientId: '', ingredientName: '', amount: 0, unit: 'g' }] });
        const response = await api.getRecipes();
        setRecipes(response.data);
    } catch (err) {
        console.error("Error creating recipe:", err);
        setError('Failed to create recipe.');
    }
  };

  // --- Cost Calculation Handler ---

  const handleCalculateCost = async (recipeId: string) => {
    try {
        const response = await api.getRecipeCost(recipeId);
        setSelectedRecipeCost(response.data);
        setIsCostModalOpen(true);
    } catch (err) {
        console.error("Error calculating cost:", err);
        setError('Failed to calculate recipe cost.');
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Recipes</h1>
        <button className="action-button" onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus /> Create Recipe
        </button>
      </header>

      <div className="recipe-grid">
        {recipes.map(recipe => (
        <div key={recipe._id} className="recipe-card">
            <h3>{recipe.recipeName}</h3>
            <p>{recipe.description || 'No description provided.'}</p>
            <div className="card-actions">
                <Link to={`/recipe/${recipe._id}`} className="view-button">View detailed cost</Link>
                <button onClick={() => handleCalculateCost(recipe._id)}>
                    <FaDollarSign /> Quick Cost
                </button>
            </div>
        </div>
        ))}
      </div>

      {/* --- Create Recipe Modal --- */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={() => setIsCreateModalOpen(false)}><FaTimes /></button>
            <h2>Create New Recipe</h2>
            <form onSubmit={handleCreateRecipeSubmit} className="recipe-form">
              <div className="form-group">
                <label htmlFor="recipeName">Recipe Name</label>
                <input 
                  id="recipeName"
                  name="recipeName" 
                  className="form-input" 
                  value={newRecipe.recipeName} 
                  onChange={handleRecipeInputChange} 
                  placeholder="e.g., Chocolate Chip Cookies" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  name="description" 
                  className="form-textarea" 
                  value={newRecipe.description} 
                  onChange={handleRecipeInputChange} 
                  placeholder="A short and sweet description" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="instructions">Instructions</label>
                <textarea 
                  id="instructions"
                  name="instructions" 
                  className="form-textarea" 
                  value={newRecipe.instructions} 
                  onChange={handleRecipeInputChange} 
                  placeholder="Step 1: Mix flour and sugar..." 
                  required 
                />
              </div>
              
              <h4>Ingredients</h4>
              {newRecipe.ingredients.map((ing, index) => (
                <div key={index} className="ingredient-form-row">
                  <select 
                    value={ing.ingredientId} 
                    className="form-select" 
                    onChange={e => handleIngredientChange(index, 'ingredientId', e.target.value)} 
                    required
                  >
                    <option value="" disabled>Select Ingredient</option>
                    {ingredients.map(masterIng => (
                      <option key={masterIng._id} value={masterIng._id}>{masterIng.name}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    className="form-input"
                    value={ing.amount} 
                    onChange={e => handleIngredientChange(index, 'amount', e.target.value)} 
                    placeholder="Amount" 
                    required 
                  />
                  <input 
                    value={ing.unit} 
                    className="form-input" 
                    onChange={e => handleIngredientChange(index, 'unit', e.target.value)} 
                    placeholder="Unit (e.g., g, cup)" 
                    required 
                  />
                  <button type="button" onClick={() => removeIngredientField(index)}><FaTimes /></button>
                </div>
              ))}
              <button type="button" className="add-ingredient-button" onClick={addIngredientField}>+ Add Ingredient</button>

              <button type="submit" className="submit-button">Save Recipe</button>
            </form>
          </div>
        </div>
      )}
      
      {/* --- Recipe Cost Modal --- */}
      {isCostModalOpen && selectedRecipeCost && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={() => setIsCostModalOpen(false)}><FaTimes /></button>
            <h2>Cost for {selectedRecipeCost.recipeName}</h2>
            <h3 className="total-cost">Total Cost: ${selectedRecipeCost.totalCost.toFixed(2)}</h3>
            <ul className="cost-breakdown">
                {selectedRecipeCost.ingredientCosts.map((item, index) => (
                    <li key={index}>
                        <span>{item.name}</span>
                        <span>${item.cost.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;