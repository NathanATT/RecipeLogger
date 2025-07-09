// Type for a single master ingredient
export interface Ingredient {
  _id: string;
  name: string;
  description?: string;
  latestPricePerGram: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for a recipe's embedded ingredient line item
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
}

// Type for a full recipe document
export interface Recipe {
  _id: string;
  recipeName: string;
  description?: string;
  instructions: string;
  servings?: number;
  ingredients: RecipeIngredient[];
  createdAt?: string;
  updatedAt?: string;
}

// Type for a purchase log
export interface Purchase {
  ingredientId: string;
  price: number;
  quantityPurchased: number;
  purchaseUnit: string;
  purchaseDate?: string;
}

// Type for the global settings
export interface ConversionSettings {
  customToGramConversions: {
    [key: string]: number; // A map of string keys to number values
  };
}

// Type for the recipe cost calculation result
export interface RecipeCost {
    _id: string;
    recipeName: string;
    totalCost: number;
    ingredientCosts: {
        name: string;
        cost: number;
        amount: string;
        calculatedAmount: string;
        pricePerUnit: string;
    }[];
}

// Type for parsed single ingredients
export interface ParsedIngredientPayload {
  name: string;
  amount: number;
  unit: string;
}

// Type for full recipe from text input
export interface CreateRecipeFromTextPayload {
  recipeName: string;
  description?: string;
  instructions?: string;
  servings?: number;
  ingredients: ParsedIngredientPayload[];
}