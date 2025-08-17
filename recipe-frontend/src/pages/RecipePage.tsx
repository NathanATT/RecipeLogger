import React, { useState, useEffect,} from 'react';

import * as api from '../api/apiService';
import type { Recipe, RecipeCost } from '../types';
import RecipeFormModal from '../components/RecipeFormModal';
import './RecipePage.css';
import { FaPlus, FaDollarSign, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    mode: 'form' | 'cost' | null; 
    data: Recipe | RecipeCost | null;
  }>({ mode: null, data: null });


  
  // -------- Data Fetching --------
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recipesRes] = await Promise.all([
        api.getRecipes(),
        api.getIngredients()
      ]);
      setRecipes(recipesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  // -------- Modal & Form Handlers --------
  const handleOpenFormModal = (recipe: Recipe | null = null) => {
    setModal({ mode: 'form', data: recipe });
  };

  const handleOpenCostModal = async (recipeId: string) => {
      const response = await api.getRecipeCost(recipeId);
      setModal({ mode: 'cost', data: response.data });
  };
  
  const handleCloseModal = () => {
    setModal({ mode: null, data: null });
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
      //const response = await api.getRecipeCost(recipeId);
      handleOpenCostModal(recipeId);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to calculate recipe cost.');
    }
  };


  
  // Extra loading and errors
  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (error && !modal.mode) return <div className="error-message page-error">{error}</div>;

return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Recipes</h1>
        <button className="action-button" onClick={() => handleOpenFormModal()}>
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
              <button className="icon-button" title="Edit" onClick={() => handleOpenFormModal(recipe)}><FaEdit/></button>
              <button className="icon-button" title="Quick Cost" onClick={() => handleCalculateCost(recipe._id)}><FaDollarSign/></button>
              <button className="icon-button delete" title="Delete" onClick={() => handleDeleteRecipe(recipe._id)}><FaTrash/></button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL SECTION --- */}
      {/* --- Create/Edit Recipe Modal --- */}
      <RecipeFormModal 
        isOpen={modal.mode === 'form'}
        onClose={handleCloseModal}
        onSuccess={loadData}
        initialRecipeData={modal.data as Recipe | null}
      />
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