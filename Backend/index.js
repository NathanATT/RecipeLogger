if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const ConversionSetting = require('./models/conversionSetting');
const recipeRoutes = require('./routes/recipeRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; 

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
};

app.use(cors(corsOptions));
app.use(express.json());

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

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");

    app.use('/api/recipes', recipeRoutes);
    app.use('/api/ingredients', ingredientRoutes);
    app.use('/api/purchases', purchaseRoutes);
    app.use('/api/settings', settingRoutes);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    initializeSettings();
  })
  .catch((e) => {
    console.error('Failed to connect to MongoDB:', e);
    process.exit(1);
  });