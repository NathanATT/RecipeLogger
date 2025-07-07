const ConversionSetting = require('../models/conversionSetting');

// Custom error for better handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const findGlobalSettings = async () => {
    const settings = await ConversionSetting.findOne({ key: 'global' });
    if (!settings) {
        // This should not happen in a running application due to the startup check.
        throw new AppError('Global settings document not found. The application may need to be restarted.', 500);
    }
    return settings;
};

const updateGlobalSettings = async (updateData) => {
    // We only want to allow updates to the conversions map.
    const { customToGramConversions } = updateData;

    if (!customToGramConversions || typeof customToGramConversions !== 'object') {
        throw new AppError('Invalid data format. `customToGramConversions` must be an object.', 400);
    }

    // Find the single settings document and update it.
    // The 'upsert' option is false because we assume it always exists.
    // { new: true } ensures the updated document is returned.
    const updatedSettings = await ConversionSetting.findOneAndUpdate(
        { key: 'global' },
        { $set: { customToGramConversions: new Map(Object.entries(customToGramConversions)) } },
        { new: true, runValidators: true }
    );

    if (!updatedSettings) {
        throw new AppError('Could not find settings to update.', 404);
    }

    return updatedSettings;
};

module.exports = {
  findGlobalSettings,
  updateGlobalSettings,
};