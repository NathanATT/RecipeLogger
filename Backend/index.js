//
// STEP 1: LOAD ENVIRONMENT VARIABLES FIRST!
//
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

//
// STEP 2: Now that process.env is populated, require other modules.
//
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your models and routes
const ConversionSetting = require('./models/conversionSetting');
const recipeRoutes = require('./routes/recipeRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const settingRoutes = require('./routes/settingRoutes');

//
// STEP 3: Define constants and initialize the app
//
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Store it in a constant for clarity

// Configure CORS using the now-defined environment variable
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
};

//
// STEP 4: Apply middleware
//
app.use(cors(corsOptions));
app.use(express.json());

//
// STEP 5: Define helper functions
//
async function initializeSettings() {
  try {
    const settings = await ConversionSetting.findOne({ key: 'global' });
    if (!settings) {
      console.log('No global settings found. Creating default settings...');
      await new ConversionSetting().save();
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

//
// STEP 6: Connect to the database and start the server
//
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");

    // Mount your API routes
    app.use('/api/recipes', recipeRoutes);
    app.use('/api/ingredients', ingredientRoutes);
    app.use('/api/purchases', purchaseRoutes);
    app.use('/api/settings', settingRoutes);

    // Start listening for requests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Initialize settings after the connection is established
    initializeSettings();
  })
  .catch((e) => {
    console.error('Failed to connect to MongoDB:', e);
    process.exit(1);
  });