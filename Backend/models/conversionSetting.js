const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversionSettingSchema = new Schema({
  
  key: {
    type: String,
    default: 'global',
    unique: true, // set unique key for only a single copy of conversion 
  },
  // Create map for custom set measurements
  customToGramConversions: {
    type: Map,
    of: Number,
    default: {
      'cup': 250, 
      'tbsp': 15,   
      'tsp': 5,     
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('ConversionSetting', conversionSettingSchema);