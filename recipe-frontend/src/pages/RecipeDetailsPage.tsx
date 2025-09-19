import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api/apiService';
import type { Recipe, RecipeCost } from '../types';
import './RecipeDetailsPage.css'; // New CSS file
import { FaArrowLeft, FaCalculator } from 'react-icons/fa';
import { formatNumberWithCommas } from '../utils/utilities';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [baseCost, setBaseCost] = useState<RecipeCost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for Scaling and Profit Calculation ---
  const [desiredServings, setDesiredServings] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [itemsSold, setItemsSold] = useState<string>('');

  useEffect(() => {
    if (!id) {
      setError("No recipe ID provided.");
      setIsLoading(false);
      return;
    }

    const loadRecipeData = async () => {
      try {
        setIsLoading(true);
        // Fetch both the recipe details and its base cost at once
        const [recipeRes, costRes] = await Promise.all([
          api.getRecipeById(id), 
          api.getRecipeCost(id)
        ]);
        
        setRecipe(recipeRes.data);
        setBaseCost(costRes.data);
        setDesiredServings(recipeRes.data.servings || 1); // Default to original servings
        setError(null);
      } catch (err) {
        setError("Failed to load recipe details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipeData();
  }, [id]);

  // --- Calculation Logic ---
  const originalServings = recipe?.servings || 1;
  const scalingFactor = desiredServings / originalServings;

  const scaledCost = (baseCost?.totalCost || 0) * scalingFactor;
  
  const revenue = parseFloat(sellingPrice) * parseFloat(itemsSold);
  const totalProfit = revenue - scaledCost;
  const profitPerItem = totalProfit / parseFloat(itemsSold);
  const profitMargin = (totalProfit / revenue) * 100;
  // Can be added with more calculations if neccessary 

  if (isLoading) return <div className="loading-spinner">Loading Recipe...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!recipe) return <div className="error-message">Recipe not found.</div>;

  return (
    <div className="page-container detail-page-container">
      <header className="page-header">
        <Link to="/" className="back-link"><FaArrowLeft /> Back to Recipes</Link>
        <h1>{recipe.recipeName}</h1>
      </header>
      
      <div className="detail-grid">
        {/* --- Left Column: Recipe and Scaling --- */}
        <div className="recipe-info-panel">
          <h2>Scaled Ingredients</h2>
          <div className="scaling-controls">
            <label htmlFor="servings">Desired Servings:</label>
            <input
              id="servings"
              type="number"
              min="1"
              value={desiredServings}
              onChange={(e) => setDesiredServings(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          
          <div className="ingredient-groups-list">
            {recipe.ingredientGroups.map((group, groupIndex) => (
              // You can use the <details> and <summary> HTML elements for a simple, accessible accordion
              <details key={groupIndex} open> {/* 'open' makes it expanded by default */}
                <summary className="group-header">{group.groupName}</summary>
                <ul className="scaled-ingredient-list">
                  {group.ingredients.map((ing, ingIndex) => (
                    <li key={ingIndex}>
                      <span className="ing-name">{ing.ingredientName}</span>
                      <span className="ing-amount">{(ing.amount * scalingFactor).toFixed(2)} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        {/* --- Right Column: Costing and Profit --- */}
        <div className="profit-calculator-panel">
          <h2><FaCalculator /> Cost & Profit Calculator</h2>

          <div className="cost-summary">
            <h4>Base Recipe Cost</h4>
            <p>${(baseCost?.totalCost || 0).toFixed(2)} for {originalServings} servings</p>
            <h4>Scaled Production Cost</h4>
            <p className="highlighted-cost">${scaledCost.toFixed(2)} for {desiredServings} servings</p>
          </div>

          <div className="profit-inputs">
            <div>
              <label htmlFor="sellingPrice">Selling Price (per item)</label>
              <input 
                id="sellingPrice"
                type="number"
                placeholder="e.g., 3.50"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="itemsSold">Number of Items to Sell</label>
              <input 
                id="itemsSold"
                type="number"
                placeholder="e.g., 24 (cookies)"
                value={itemsSold}
                onChange={(e) => setItemsSold(e.target.value)}
              />
            </div>
          </div>
          
          {/* Only show results if inputs are valid */}
          {revenue > 0 && isFinite(revenue) && (
            <div className="profit-results">
              <h4>Profit Analysis</h4>
              <div className="result-grid">
                <div><span>Total Revenue</span><strong>${formatNumberWithCommas(revenue.toFixed(2))}</strong></div>
                <div><span>Total Cost</span><strong>-${formatNumberWithCommas(scaledCost.toFixed(2))}</strong></div>
                <div><span>Net Profit</span><strong className="net-profit">${formatNumberWithCommas(totalProfit.toFixed(2))}</strong></div>
                <div><span>Profit per Item</span><strong>${formatNumberWithCommas(profitPerItem.toFixed(2))}</strong></div>
                <div><span>Profit Margin</span><strong>{formatNumberWithCommas(profitMargin.toFixed(1))}%</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;