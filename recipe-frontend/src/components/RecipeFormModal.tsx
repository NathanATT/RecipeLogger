import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import * as api from '../api/apiService';
import type { Recipe, CreateRecipeFromTextPayload, Ingredient, TextIngredientPayload } from '../types';
import { parseIngredientsFromText, type ParsedItem } from '../utils/recipeParser';
import { transformIngredientsToText } from '../utils/recipeTransformer';
import SearchableReferenceTable from './SearchableReferenceTable';
import * as validationService from '../services/validationService';
import { FaTimes, FaSave } from 'react-icons/fa';
import './RecipeFormModal.css';

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
  
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);


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
            ingredientsText: transformIngredientsToText(fullRecipe.ingredientGroups),
          });
        } catch (err) {
          setError("Failed to load recipe details for editing.");
          console.error("Error loading recipe details for editing:", err);
        } finally {
          setIsLoading(false);
        }
      };

      const loadReferenceData = async () => {
        try {
          const [ingredientsRes, unitsSet] = await Promise.all([
            api.getIngredients(),
            validationService.getValidUnits(),
          ]);
          setAllIngredients(ingredientsRes.data);
          setAvailableUnits(Array.from(unitsSet));
        } catch (err) {
          console.error("Error loading reference data:", err);
          setError("Failed to load reference data.");
        }
      }
      
      loadReferenceData();
      fetchFullRecipe();
    } else {
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
    
    const parsedItems: ParsedItem[] = parseIngredientsFromText(formState.ingredientsText);
    if (parsedItems.length === 0) {
      setError("Could not parse any valid ingredients. Format: 'name amount unit'.");
      setIsSubmitting(false);
      return;
    }

    const payload: CreateRecipeFromTextPayload = {
      recipeName: formState.recipeName,
      description: formState.description,
      instructions: formState.instructions,
      servings: Number(formState.servings),
      ingredients: parsedItems.map((item): TextIngredientPayload => {
        if (item.isGroupHeader) {
          return { name: item.name, isGroupHeader: true };
        }
        return { name: item.name, amount: item.amount, unit: item.unit, isGroupHeader: false };
      }),
    };

    try {
      if (initialRecipeData?._id) {
        await api.updateRecipe(initialRecipeData._id, payload);
      } else {
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
      <div className="modal-content recipe-form-modal-content">
        <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        <h2>{initialRecipeData ? 'Edit Recipe' : 'Create New Recipe'}</h2>

        <div className="recipe-form-grid">
          
          {/* --- COLUMN 1: THE MAIN FORM --- */}
          <form onSubmit={handleSubmit} className="recipe-form-main">
            {isLoading ? (
              <div className="loading-spinner">Loading recipe details...</div>
            ) : (
              <>
                {error && <div className="error-message form-feedback">{error}</div>}
                
                {/* --- THIS IS THE NEW WRAPPER --- */}
                <div className="form-scroll-content">
                  <div className="form-group">
                    <label htmlFor="recipeName">Recipe Name</label>
                    <input id="recipeName" name="recipeName" className="form-input" value={formState.recipeName} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="servings">Servings</label>
                    <input id="servings" name="servings" type="number" min="1" className="form-input" value={formState.servings} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea id="description" name="description" className="form-textarea" rows={3} value={formState.description} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="instructions">Instructions (Optional)</label>
                    <textarea id="instructions" name="instructions" className="form-textarea" rows={5} value={formState.instructions} onChange={handleInputChange} />
                  </div>

                  <div className="form-group ingredients-group">
                    <label htmlFor="ingredientsText">Ingredients</label>
                    <p className="settings-description">
                      Use <strong>- Group Name</strong> for sections. Then list ingredients: <strong>name amount unit</strong>
                    </p>
                    <textarea
                      id="ingredientsText"
                      name="ingredientsText"
                      className="form-textarea"
                      placeholder={"- Dough\nflour 500 g\nyeast 10 g\n\n- Topping\ncheese 100 g"}
                      value={formState.ingredientsText}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                {/* --- END OF NEW WRAPPER --- */}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : <><FaSave /> Save Changes</>}
                </button>
              </>
            )}
          </form>

          {/* --- COLUMN 2: THE REFERENCE SIDEBAR --- */}
          <div className="reference-sidebar">
            <SearchableReferenceTable
              title="Available Ingredients"
              items={allIngredients.map(ing => ing.name)}
              placeholder="Search ingredients..."
            />
            <SearchableReferenceTable
              title="Available Units"
              items={availableUnits}
              placeholder="Search units..."
            />
          </div>
        </div>
      </div>
    </div>
  );  
};

export default RecipeFormModal;