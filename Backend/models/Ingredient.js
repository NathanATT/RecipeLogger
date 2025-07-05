const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        trim: true,
        unique : true
    },
    description: {
        type: String,
        trim: true
    },
    
    // -- Cached fields --

    latestPricePerUnit: {
        type: Number,
        default: 0
    },
    standardUnit: {
        type: String,
        required: [true, 'A standard unit (e.g., gram, ml, item) is required.']
    },
    lastUpdated: {
        type: Date
    }
    }, {

    timestamps: true
    });


    module.exports = mongoose.model('Ingredient', ingredientSchema);