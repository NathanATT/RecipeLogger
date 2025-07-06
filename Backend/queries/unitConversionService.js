const convert = require('convert-units');
const ConversionSetting = require('../models/conversionSetting');

let globalSettings = null;
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getGlobalSettings = async () => {
    const now = Date.now();
    if (globalSettings && (now - lastFetched < CACHE_DURATION)) {
        return globalSettings;
    }
    
    globalSettings = await ConversionSetting.findOne({ key: 'global' });
    if (!globalSettings) {
        // extra catch just in case 
        throw new Error('Global conversion settings are not configured.');
    }
    lastFetched = now;
    return globalSettings;
};


const convertToGrams = async (amount, unit) => {
    const fromUnit = unit.toLowerCase();

    // 1. Base Case: Already in grams.
    if (fromUnit === 'g' || fromUnit === 'gram') {
        return amount;
    }

    // 2. Custom Conversion: Check our global settings first.
    const settings = await getGlobalSettings();
    const customConversionFactor = settings.customToGramConversions.get(fromUnit);
    if (customConversionFactor) {
        return amount * customConversionFactor;
    }

    // 3. Standard Conversion: Fall back to the convert-units library.
    try {
        return convert(amount).from(fromUnit).to('g');
    } catch (error) {
        throw new Error(
        `Cannot convert from '${unit}' to grams. ` +
        `The unit is not a standard convertible unit and has no custom setting defined.`
        );
    }
};

module.exports = {
  convertToGrams,
};