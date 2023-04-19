const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});

tourSchema.plugin(uniqueValidator);

// Create a model from the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;