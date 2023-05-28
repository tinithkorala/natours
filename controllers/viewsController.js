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

exports.getTour = catchAsync( async (req, res) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    res.status(200).render('tour', {
        title: 'The forest hicker',
        tour
    });
});