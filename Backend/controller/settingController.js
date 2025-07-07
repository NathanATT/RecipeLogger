const settingQuery = require('../queries/settingQuery');

module.exports = {
    getSettings : async (req, res) => {
    try {
        const settings = await settingQuery.findGlobalSettings();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings.', error: error.message });
    }
    },

    updateSettings : async (req, res) => {
    try {
        // The request body should contain the `customToGramConversions` object.
        const updatedSettings = await settingQuery.updateGlobalSettings(req.body);
        res.status(200).json({
        message: 'Settings updated successfully.',
        settings: updatedSettings,
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({ message: error.message });
    }
    }
}