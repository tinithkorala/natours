const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}



exports.updateMe = catchAsync( async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfrim) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    // 2) Filtered out unwanted fields names that  are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }); 

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
});

exports.deleteMe = catchAsync( async (req, res, next) => {
    await  User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
}
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined!'
    });
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);