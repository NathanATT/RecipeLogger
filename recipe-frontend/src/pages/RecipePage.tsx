import React, { useState, useEffect,} from 'react';
import type { FormEvent } from 'react'
import * as api from '../api/apiService';
import type { Recipe, Ingredient, RecipeCost } from '../types';
import './RecipePage.css';
import { FaPlus, FaDollarSign, FaTimes, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { parseIngredientsFromText } from '../utils/recipeParser';
import { isUnitValid } from '../services/validationService';

type RecipeFormState = Omit<Recipe, '_id' | 'createdAt' | 'updatedAt'> & { id?: string };

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    mode: 'create' | 'edit' | 'cost' | null;
    data: Recipe | RecipeCost | null;
  }>({ mode: null, data: null });

  const initialFormState: RecipeFormState = {
    recipeName: '',
    description: '',
    instructions: '',
    servings: 1,
    ingredients: [{ ingredientId: '', ingredientName: '', amount: 0, unit: 'g' }],
  };
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>(initialFormState);
  const [textRecipeForm, setTextRecipeForm] = useState({
  recipeName: '',
  description: '',
  instructions: '',
  servings: 1,
  ingredientsText: '', 
  });

  
  // -------- Data Fetching --------
  useEffect(() => { loadData(); }, []);
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

  // -------- Modal & Form Handlers --------
  const handleOpenModal = (mode: 'create' | 'edit' | 'cost', data: Recipe | RecipeCost | null = null) => {
    setError(null);
    if (mode === 'edit' && data) {
      setRecipeForm({ ...(data as Recipe), id: (data as Recipe)._id });
    }
    setModal({ mode, data });
  };
  
  const handleCloseModal = () => {
    setModal({ mode: null, data: null });
    setRecipeForm(initialFormState);
  };
  
  // -------- Form Input Handlers --------
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const val = name === 'servings' ? (parseInt(value, 10) || 1) : value;
    setRecipeForm(prev => ({ ...prev, [name]: val }));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const updatedIngredients = [...recipeForm.ingredients];
    const currentIngredient = { ...updatedIngredients[index] };
    
    if (field === 'ingredientId') {
        const selectedIng = ingredients.find(ing => ing._id === value);
        currentIngredient.ingredientId = value;
        currentIngredient.ingredientName = selectedIng ? selectedIng.name : '';
    } else if (field === 'amount') {
        currentIngredient.amount = parseFloat(value) || 0;
    } else {
        currentIngredient.unit = value;
    }
    updatedIngredients[index] = currentIngredient;
    setRecipeForm(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredientField = () => {
    setRecipeForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { ingredientId: '', ingredientName: '', amount: 0, unit: 'g' }] }));
  };
  const removeIngredientField = (index: number) => {
    setRecipeForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  // -------- CRUD Handlers --------
  const handleRecipeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { id, ...recipeData } = recipeForm;
      if (modal.mode === 'edit' && id) {
        await api.updateRecipe(id, recipeData);
      } else {
        await api.createRecipe(recipeData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to save recipe.');
    }
  };
  
  const handleDeleteRecipe = async (recipeId: string) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await api.deleteRecipe(recipeId);
        loadData();
      } catch (err) {
        const apiError = err as ApiError;
        alert(apiError.response?.data?.message || "Failed to delete recipe.");
      }
    }
  };

  const handleCalculateCost = async (recipeId: string) => {
    setError(null);
    try {
      const response = await api.getRecipeCost(recipeId);
      handleOpenModal('cost', response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to calculate recipe cost.');
    }
  };

  // -------- Text Parsing --------
  const handleTextRecipeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const parsedIngredients = parseIngredientsFromText(textRecipeForm.ingredientsText);
    if (parsedIngredients.length === 0) {
      setError("Could not parse any valid ingredients. Please check the format (e.g., 'flour 100 g').");
      return;
    }

    // Validate each parsed ingredient's unit
    for (const ing of parsedIngredients) {
      const isValid = await isUnitValid(ing.unit);
      if (!isValid) {
        setError(`Invalid unit "${ing.unit}" for ingredient "${ing.name}". Please use a valid unit (e.g., g, cup, piece).`);
        return;
      }
    }
    
    // Setup payload
    const payload = {
      recipeName: textRecipeForm.recipeName,
      description: textRecipeForm.description,
      instructions: textRecipeForm.instructions,
      servings: textRecipeForm.servings,
      ingredients: parsedIngredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      })),
    };

    try {
      await api.createRecipeFromText(payload); 
      handleCloseModal(); 
      loadData(); 
    } catch (err) {
      setError('Failed to create recipe.');
      console.error(err)
    }
  };

  
  // Extra loading and errors
  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (error && !modal.mode) return <div className="error-message page-error">{error}</div>;

return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Recipes</h1>
        <button className="action-button" onClick={() => handleOpenModal('create')}>
          <FaPlus /> Create Recipe
        </button>
      </header>
      {error && !modal.mode && <div className="error-message page-error">{error}</div>}

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <div key={recipe._id} className="recipe-card">
            <h3>{recipe.recipeName}</h3>
            <p>{recipe.description || 'No description provided.'}</p>
            <div className="card-actions">
              <Link to={`/recipe/${recipe._id}`} className="action-link-button">View & Cost</Link>
              <button className="icon-button" title="Edit" onClick={() => handleOpenModal('edit', recipe)}><FaEdit/></button>
              <button className="icon-button" title="Quick Cost" onClick={() => handleCalculateCost(recipe._id)}><FaDollarSign/></button>
              <button className="icon-button delete" title="Delete" onClick={() => handleDeleteRecipe(recipe._id)}><FaTrash/></button>
            </div>
          </div>
        ))}
      </div>

{/* --- MODAL SECTION --- */}
{/* --- Create/Edit Recipe Modal --- */}
{(modal.mode === 'create' || modal.mode === 'edit') && (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close-button" onClick={handleCloseModal}><FaTimes /></button>
      <h2>{modal.mode === 'edit' ? 'Edit Recipe' : 'Create New Recipe'}</h2>
      {modal.mode === 'create' ? (
        <form onSubmit={handleTextRecipeSubmit}>
          {error && <div className="error-message form-feedback">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="recipeName-text">Recipe Name</label>
            <input
              id="recipeName-text"
              className="form-input"
              value={textRecipeForm.recipeName}
              onChange={(e) => setTextRecipeForm({ ...textRecipeForm, recipeName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="servings-text">Servings</label>
            <input
              id="servings-text"
              type="number"
              min="1"
              className="form-input"
              value={textRecipeForm.servings}
              onChange={(e) => setTextRecipeForm({ ...textRecipeForm, servings: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description-text">Description (Optional)</label>
            <textarea
              id="description-text"
              className="form-textarea"
              rows={3}
              value={textRecipeForm.description}
              onChange={(e) => setTextRecipeForm({ ...textRecipeForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions-text">Instructions</label>
            <textarea
              id="instructions-text"
              className="form-textarea"
              rows={6}
              value={textRecipeForm.instructions}
              onChange={(e) => setTextRecipeForm({ ...textRecipeForm, instructions: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ingredientsText">Ingredients</label>
            <p className="settings-description">
              Enter one ingredient per line: <strong>name amount unit</strong>
            </p>
            <textarea
              id="ingredientsText"
              className="form-textarea"
              rows={10}
              placeholder={"flour 250 g\nsugar 125 g..."}
              value={textRecipeForm.ingredientsText}
              onChange={(e) => setTextRecipeForm({ ...textRecipeForm, ingredientsText: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-button"><FaSave /> Create Recipe</button>
        </form>
      ) : (
        // --- Detailed Edit Form ---
        <form onSubmit={handleRecipeSubmit}>
          {error && <div className="error-message form-feedback">{error}</div>}
          <div className="form-group">
            <label htmlFor="recipeName-detail">Recipe Name</label>
            <input id="recipeName-detail" name="recipeName" value={recipeForm.recipeName} onChange={handleFormInputChange} required className="form-input"/>
          </div>
          <div className="form-group">
              <label htmlFor="servings-detail">Servings</label>
              <input id="servings-detail" name="servings" type="number" min="1" value={recipeForm.servings} onChange={handleFormInputChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label htmlFor="description-detail">Description (Optional)</label>
            <textarea id="description-detail" name="description" className="form-textarea" rows={3} value={recipeForm.description} onChange={handleFormInputChange}/>
          </div>
          <div className="form-group">
            <label htmlFor="instructions-detail">Instructions</label>
            <textarea id="instructions-detail" name="instructions" className="form-textarea" rows={6} value={recipeForm.instructions} onChange={handleFormInputChange} required/>
          </div>
          
          <h4>Ingredients</h4>
          {recipeForm.ingredients.map((ing, index) => (
            <div key={index} className="ingredient-form-row">
              <select value={ing.ingredientId} className="form-select" onChange={e => handleIngredientChange(index, 'ingredientId', e.target.value)} required>
                <option value="" disabled>Select Ingredient</option>
                {ingredients.map(masterIng => (
                  <option key={masterIng._id} value={masterIng._id}>{masterIng.name}</option>
                ))}
              </select>
              <input type="number" value={ing.amount} className="form-input" onChange={e => handleIngredientChange(index, 'amount', e.target.value)} placeholder="Amount" required />
              <input value={ing.unit} className="form-input" onChange={e => handleIngredientChange(index, 'unit', e.target.value)} placeholder="Unit (g, cup)" required />
              <button type="button" className="delete-rule-btn" onClick={() => removeIngredientField(index)}><FaTimes /></button>
            </div>
          ))}
          <button type="button" className="add-ingredient-button" onClick={addIngredientField}>+ Add Ingredient</button>
          <button type="submit" className="submit-button"><FaSave /> Save Changes</button>
        </form>
      )}
    </div>
  </div>
)}
      {/* --- Recipe Cost Modal --- */}
      {modal.mode === 'cost' && modal.data && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseModal}><FaTimes /></button>
            {'totalCost' in modal.data && (
              <>
                <h2>Cost for {modal.data.recipeName}</h2>
                <h3 className="total-cost">Total Cost: ${modal.data.totalCost.toFixed(2)}</h3>
                <ul className="cost-breakdown">
                    {modal.data.ingredientCosts.map((item, index) => (
                        <li key={index}>
                            <span>{item.name}</span>
                            <span>${item.cost.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;