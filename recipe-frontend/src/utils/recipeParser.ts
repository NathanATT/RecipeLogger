interface ParsedIngredient {
    name: string;
    amount: number;
    unit: string;
}

export const parseIngredientsFromText = (text: string): ParsedIngredient[] => {
    const lines = text.split('\n').filter(line => line.trim() != '');
    const parsed = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 3) {
            return null
        }

        const unit = parts.pop()!;
        const amountStr = parts.pop()!;
        const amount = parseFloat(amountStr);

        const name = parts.join(' ')

        if (isNaN(amount) || !name) {
            return null
        }

        return { name, amount, unit}
    });

    return parsed.filter((p): p is ParsedIngredient => p !== null)
};

