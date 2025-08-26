const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Joint table for per recipe ingredient requirement 
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

const ingredientGroupSchema = new Schema({
  groupName: {
    type: String,
    required: true,
    default: 'Main'
  },
  ingredients: [recipeIngredientSchema]
}, { _id: false });

// Recipe model
const recipeSchema = new Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
// can be stuff for later not rly wanna trouble myself rn
//   instructions: {
//     type: String,
//     required: true
//   },
  servings: {
    type: Number
  },
  ingredientGroups: [ingredientGroupSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);