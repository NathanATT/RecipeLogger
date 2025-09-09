// have to seperate group and ingredient types for type guarding
// Header type
export interface ParsedGroupHeader {
  name: string;
  isGroupHeader: true;
}

// Ingredient type 
export interface ParsedIngredientLine {
  name: string;
  amount: number;
  unit: string;
  isGroupHeader: false;
}

// union type for type guarding
export type ParsedItem = ParsedGroupHeader | ParsedIngredientLine;


/**
 * Parses a block of text into an array of structured items (groups or ingredients).
 * @param {string} text - The raw text from the textarea.
 * @returns {ParsedItem[]} An array of structured items.
 */
export const parseIngredientsFromText = (text: string): ParsedItem[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // The .map function now returns `ParsedItem | null`
  const parsedItems = lines.map((line): ParsedItem | null => {
    line = line.trim();

    // Check for Group Header
    if (line.startsWith('- ')) {
      // parser returns a header object
      return {
        name: line.substring(2).trim(),
        isGroupHeader: true,
      };
    }

    const parts = line.split(/\s+/);
    if (parts.length < 3) return null;
    
    const unit = parts.pop()!;
    const amountStr = parts.pop()!;
    const amount = parseFloat(amountStr);
    const name = parts.join(' ');
    
    if (isNaN(amount) || !name) return null;
    
    // parser returns an ingredient object
    return { name, amount, unit, isGroupHeader: false };
  });
  
  // The type predicate checks if p is a valid parseditem.
  // Matches ParsedItem and filters out nulls. 
  // this ensures return is parsed item which can be a header or ingredient.
  return parsedItems.filter((p): p is ParsedItem => p !== null);
};