import convert from 'convert-units';    
import { getSettings } from '../api/apiService';
let validUnitsSet: Set<string> | null = null;

/**
 * Fetches all possible valid units (custom + standard) and caches them.
 * @returns {Promise<Set<string>>} A Set containing all valid unit strings.
 */
const getValidUnits = async (): Promise<Set<string>> => {
    if (validUnitsSet) {
        return validUnitsSet; 
    }

    const settingResponse = await getSettings();
    const customUnits = Object.keys(settingResponse.data.customToGramConversions);

    const standardMassUnits = convert().possibilities('mass');
    //const standardVolumeUnits = convert().possibilities('volume');
    const allUnits = [...customUnits, ...standardMassUnits].map(u => u.toLowerCase());
    validUnitsSet = new Set(allUnits);
    return validUnitsSet;
};

/**
 * Checks if a single unit string is valid according to our system rules.
 * @param {string} unit - The unit to validate (e.g., "piece", "g", "cup").
 * @returns {Promise<boolean>} True if the unit is valid, false otherwise.
 */
export const isUnitValid = async (unit: string): Promise<boolean> => {
  const allValidUnits = await getValidUnits();
  return allValidUnits.has(unit.toLowerCase());
};