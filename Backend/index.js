const express = require('express')
const mongoose = require('mongoose');
const ConversionSetting = require('../models/ConversionSetting.js');
const app = express()
var cors = require('cors');
const env = require('dotenv');

env.config({path: './config/.env'});

const PORT = process.env.PORT || 5000
app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGOOSE_URI)
.then(() => {
    console.log("success!!");
    app.listen(PORT,() => {
        console.log('poodle')
    });
    initializeSettings();
    
})

// starter function guarantee only 1 conversion setting
async function initializeSettings() {
  const settings = await ConversionSetting.findOne({ key: 'global' });
  if (!settings) {
    console.log('No global settings found. Creating default settings...');
    await new ConversionSetting().save();
  }
}