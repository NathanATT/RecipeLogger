const express = require('express')
const mongoose = require('mongoose');
const ConversionSetting = require('../Backend/models/conversionSetting');
const app = express()
var cors = require('cors');


// Import route files
const recipeRoutes = require('./routes/recipeRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
// You will likely want a route to manage your new settings
const settingRoutes = require('../Backend/routes/settingRoutes');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

const PORT = process.env.PORT || 5000
app.use(cors());

app.use(express.json());

// starter function guarantee only 1 conversion setting
async function initializeSettings() {
  const settings = await ConversionSetting.findOne({ key: 'global' });
  if (!settings) {
    console.log('No global settings found. Creating default settings...');
    await new ConversionSetting().save();
  }
}

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("success!!");
    app.listen(PORT,() => {
        console.log('poodle')
    });
    initializeSettings();
    
})
.catch((e) => { console.log(e);});

app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/settings', settingRoutes);