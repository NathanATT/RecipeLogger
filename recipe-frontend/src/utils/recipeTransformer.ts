import type{ Recipe } from '../types';

export const transformIngredientsToText = (ingredientGroups: Recipe['ingredientGroups']): string => {
  if (!ingredientGroups || ingredientGroups.length === 0) {
    return '';
  }
  
  return ingredientGroups.map(group => {

    const header = `- ${group.groupName}`;

    const ingredients = group.ingredients.map(ing => 
      `${ing.ingredientName} ${ing.amount} ${ing.unit}`
    ).join('\n');
    
    // Join the header and its ingredients
    return `${header}\n${ingredients}`;
  }).join('\n\n'); 
};