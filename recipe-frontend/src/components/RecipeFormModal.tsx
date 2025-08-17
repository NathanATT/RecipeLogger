import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import * as api from '../api/apiService';
import type { Recipe, CreateRecipeFromTextPayload } from '../types';
import { parseIngredientsFromText } from '../utils/recipeParser';
import { transformIngredientsToText } from '../utils/recipeTransformer';
import { FaTimes, FaSave } from 'react-icons/fa';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refetch data on the parent page
  initialRecipeData?: Partial<Recipe> & { _id: string } | null; // If provided, the modal is in "Edit" mode
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRecipeData = null,
}) => {
  const [formState, setFormState] = useState({
    recipeName: '',
    description: '',
    instructions: '',
    servings: 1,
    ingredientsText: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // This effect pre-populates the form when it opens in "Edit" mode
  useEffect(() => {
    // Only run when the modal is opened
    if (!isOpen) return;

    setError(null);
    
    if (initialRecipeData?._id) {
      // --- EDIT MODE ---
      setIsLoading(true);
      
      const fetchFullRecipe = async () => {
        try {
          const response = await api.getRecipeById(initialRecipeData._id);
          const fullRecipe = response.data;
          
          // Populate the form with the complete data
          setFormState({
            recipeName: fullRecipe.recipeName,
            description: fullRecipe.description || '',
            instructions: fullRecipe.instructions || '',
            servings: fullRecipe.servings || 1,
            ingredientsText: transformIngredientsToText(fullRecipe.ingredients),
          });
        } catch (err) {
          setError("Failed to load recipe details for editing.");
          console.error("Error loading recipe details for editing:", err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFullRecipe();
    } else {
      // --- CREATE MODE ---
      // Reset to a blank slate
      setFormState({ recipeName: '', description: '', instructions: '', servings: 1, ingredientsText: '' });
    }
  }, [isOpen, initialRecipeData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const parsedIngredients = parseIngredientsFromText(formState.ingredientsText);
    if (parsedIngredients.length === 0) {
      setError("Could not parse any valid ingredients. Format: 'name amount unit'.");
      setIsSubmitting(false);
      return;
    }

    const payload: CreateRecipeFromTextPayload = {
      recipeName: formState.recipeName,
      description: formState.description,
      instructions: formState.instructions,
      servings: Number(formState.servings),
      ingredients: parsedIngredients,
    };

    try {
      if (initialRecipeData?._id) {
        // EDIT MODE: Call the update endpoint
        await api.updateRecipe(initialRecipeData._id, payload);
      } else {
        // CREATE MODE: Call the create endpoint
        await api.createRecipeFromText(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to save recipe.");
      console.error("Error saving recipe:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        <h2>{initialRecipeData ? 'Edit Recipe' : 'Create New Recipe'}</h2>
        {isLoading && <div className="loading-spinner">Loading recipe...</div>}
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message form-feedback">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="recipeName">Recipe Name</label>
            <input id="recipeName" name="recipeName" className="form-input" value={formState.recipeName} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings</label>
            <input id="servings" name="servings" type="number" min="1" className="form-input" value={formState.servings} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-textarea" rows={3} value={formState.description} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <textarea id="instructions" name="instructions" className="form-textarea" rows={6} value={formState.instructions} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label htmlFor="ingredientsText">Ingredients</label>
            <p className="settings-description">One ingredient per line: <strong>name amount unit</strong></p>
            <textarea id="ingredientsText" name="ingredientsText" className="form-textarea" rows={10} value={formState.ingredientsText} onChange={handleInputChange} required />
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><FaSave /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecipeFormModal;