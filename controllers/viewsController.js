const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async (req, res, next) => {
    // Get all data from collection
    const tours = await Tour.find();
    // Build Template
    // Render that template using data from 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The forest hicker'
    });
}