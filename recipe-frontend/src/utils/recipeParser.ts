interface ParsedIngredient {
    name: string;
    amount: number;
    unit: string;
}

export const parseIngredientsFromText = (text: string): ParsedIngredient[] => {
  // Split the text block into individual lines and filter out any empty lines.
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  const parsedIngredients = lines.map(line => {
    // Split the line by one or more spaces to handle messy input.
    const parts = line.trim().split(/\s+/);
    
    // A valid line must have at least 3 parts: name (1+ words), amount, and unit.
    if (parts.length < 3) {
      console.warn(`Skipping malformed line: "${line}"`);
      return null;
    }
    
    // --- THIS IS THE NEW LOGIC ---
    
    // 1. The last part is always the unit.
    const unit = parts.pop()!; // The "!" asserts that this value is not undefined.
    
    // 2. The new last part is now the amount.
    const amountStr = parts.pop()!;
    const amount = parseFloat(amountStr);
    
    // 3. Everything else that remains in the 'parts' array is the ingredient's name.
    const name = parts.join(' ');
    
    // --- END NEW LOGIC ---

    // Validate the parsed parts. If amount is not a number or name is empty, it's invalid.
    if (isNaN(amount) || !name) {
      console.warn(`Skipping invalid line (bad amount or name): "${line}"`);
      return null;
    }
    
    return { name, amount, unit };
  });
  
  // Filter out any lines that were null (malformed or invalid)
  return parsedIngredients.filter((p): p is ParsedIngredient => p !== null);
};

