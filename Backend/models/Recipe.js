const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const recipeIngredientSchema = new Schema({
  ingredientId: {
    type: Schema.Types.ObjectId,
    ref: 'Ingredient', 
    required: true
  },
  ingredientName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  }
}, { _id: false }); 

const recipeSchema = new Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    required: true
  },
  servings: {
    type: Number
  },
  ingredients: [recipeIngredientSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);