const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
  },

    description: {
        type: String,
        trim: true,
  },

  // Price is per gram
    latestPricePerGram: {
        type: Number,
        default: 0,
  },

    lastUpdated: {
        type: Date,
  },
}, { timestamps: true });


module.exports = mongoose.model('Ingredient', ingredientSchema);


