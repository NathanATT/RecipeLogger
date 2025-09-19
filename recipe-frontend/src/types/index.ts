// ==========================================================
//                 Core Database Models
// ==========================================================

/**
 * Represents a single ingredient line item as stored within a Recipe document.
 */
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
}

/**
 * Represents a group of ingredients within a Recipe document.
 */
export interface IngredientGroup {
  groupName: string;
  ingredients: RecipeIngredient[];
}

/**
 * Represents a full Recipe document as stored in the database.
 */
export interface Recipe {
  _id: string;
  recipeName: string;
  description?: string;
  instructions?: string;
  servings?: number;
  ingredientGroups: IngredientGroup[]; // The new structure for ingredients
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a master Ingredient document as stored in the database.
 */
export interface Ingredient {
  _id: string;
  name: string;
  description?: string;
  latestPricePerGram: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a historical Purchase document as stored in the database.
 * This is also the shape for the POST /api/purchases payload.
 */
export interface Purchase {
  _id?: string;
  ingredientId: string;
  price: number;
  quantityPurchased: number;
  purchaseUnit: string;
  purchaseDate?: string;
}


// ==========================================================
//               API Payloads & Responses
// ==========================================================

/**
 * Represents one line item in the payload sent to the backend when creating/updating a recipe from text.
 * It can be either a group header or an ingredient line.
 */
export interface TextIngredientPayload {
  name: string;
  amount?: number;
  unit?: string;
  isGroupHeader: boolean;
}

/**

 * This is the full payload for the create/update-from-text recipe endpoint.
 */
export interface CreateRecipeFromTextPayload {
  recipeName: string;
  description?: string;
  instructions?: string;
  servings?: number;
  ingredients: TextIngredientPayload[];
}

/**
 * Represents a single purchase record after being populated with the ingredient name by the backend.
 */
export interface PurchaseRecord {
  _id: string;
  ingredientId: { _id: string; name: string; };
  price: number;
  quantityPurchased: number;
  purchaseUnit: string;
  purchaseDate: string;
}

/**
 * Represents the entire data payload from the GET /api/purchases endpoint.
 */
export interface PurchasesResponse {
  purchases: PurchaseRecord[];
  totalPages: number;
  currentPage: number;
}

/**
* Defines the shape of the filter, sort, and pagination object
* that can be sent as query parameters to the GET /api/purchases endpoint.
*/
export interface PurchaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Represents the data payload from the GET /api/recipes/:id/cost endpoint.
 */
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


// ==========================================================
//               Error Handling Types
// ==========================================================

/**
 * Defines the structure of the `data` object inside a failed API response from our backend.
 */
export interface ErrorResponseData {
  message: string;
  error?: string;
}

/**
 * Defines the structure of an Axios error object.
 * We use 'unknown' for complex properties that we don't interact with directly for type safety.
 */
export interface ApiError {
  response?: {
    data?: ErrorResponseData;
    status?: number;
    headers?: unknown;
  };
  message?: string;
  config?: unknown;
}