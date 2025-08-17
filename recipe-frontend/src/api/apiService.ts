import axios from 'axios';
import type { 
  Ingredient, 
  Recipe, 
  Purchase, 
  RecipeCost,
  CreateRecipeFromTextPayload,
  PurchasesResponse,
  PurchaseQueryParams
} from '../types';

const API_URL = 'http://localhost:5000/api';

// --- Ingredient API Calls ---
export const getIngredients = () => axios.get<Ingredient[]>(`${API_URL}/ingredients`);
export const createIngredient = (ingredientData: { name: string; description?: string }) => 
  axios.post<Ingredient>(`${API_URL}/ingredients`, ingredientData);
export const updateIngredient = (id: string, ingredientData: { name: string; description?: string }) =>
  axios.put<Ingredient>(`${API_URL}/ingredients/${id}`, ingredientData);
export const deleteIngredient = (id: string) => 
  axios.delete(`${API_URL}/ingredients/${id}`);


// --- Recipe API Calls ---
export const getRecipes = () => axios.get<Recipe[]>(`${API_URL}/recipes`);
export const createRecipe = (recipeData: Omit<Recipe, '_id'>) => 
  axios.post<Recipe>(`${API_URL}/recipes`, recipeData);
export const getRecipeCost = (recipeId: string) => 
  axios.get<RecipeCost>(`${API_URL}/recipes/${recipeId}/cost`);
export const getRecipeById = (id: string) => axios.get<Recipe>(`${API_URL}/recipes/${id}`);
export const updateRecipe = (id: string, recipeData: CreateRecipeFromTextPayload) =>
  axios.put<Recipe>(`${API_URL}/recipes/${id}`, recipeData);
export const deleteRecipe = (id: string) =>
  axios.delete(`${API_URL}/recipes/${id}`);
export const createRecipeFromText = (data: CreateRecipeFromTextPayload) => 
  axios.post<Recipe>(`${API_URL}/recipes/from-text`, data);

// --- Purchase API Calls ---
export const logPurchase = (purchaseData: Purchase) => 
  axios.post(`${API_URL}/purchases`, purchaseData);
export const getPurchases = (params: PurchaseQueryParams) => 
  axios.get<PurchasesResponse>(`${API_URL}/purchases`, { params });

// --- Settings API Calls ---
export const getSettings = () => axios.get<{ customToGramConversions: Record<string, number> }>(`${API_URL}/settings`);
export const updateSettings = (settingsData: { customToGramConversions: Record<string, number> }) => 
  axios.put(`${API_URL}/settings`, settingsData);
