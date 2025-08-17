import type { RecipeIngredient } from '../types';

/**
 * Converts a structured ingredients array back into a formatted, multi-line string.
 * @param {RecipeIngredient[]} ingredients - The array of ingredient objects from a recipe.
 * @returns {string} A formatted string for display in a textarea.
 */
export const transformIngredientsToText = (ingredients: RecipeIngredient[]): string => {
  if (!ingredients || ingredients.length === 0) {
    return '';
  }
  
  return ingredients
    .map(ing => `${ing.ingredientName} ${ing.amount} ${ing.unit}`)
    .join('\n');
};