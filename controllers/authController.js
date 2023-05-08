const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        status: 'success',  
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfrim: req.body.passwordConfrim,
    //     passwordChangeAt: req.body.passwordChangeAt
    // });

    // const token = signToken(newUser._id);
    // res.status(201).json({
    //     status: 'success',  
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check is email and password is exist
    if(!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check is user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    // const correct = await user.correctPassword(password, user.password); 

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401)); 
    }

    // 3) If everything ok, send token to client
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });

    createSendToken(user, 200, res);

});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if its there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(new AppError('You are not logged in! Please login to get access.', 401));
    }
    // 2) Verification token
    // jwt.verify(token, process.env.JWT_SECRET);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user still exists 
    const currenthUser = await User.findById(decoded.id);
    if(!currenthUser) {
        return next(new AppError('The user belonging to this token dose no longer exist', 401));
    }
    // 4) Check if user changed password after the token was issued
    if(currenthUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    }

    req.user = currenthUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed  email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('There is no user with email address.', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });                      
    // 3) Send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfrim to: ${resetUrl} .\n
    If you didn't forget your password, please ignore this email !`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            subject: 'Token sent to email!'
        });
    }catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false }); 
        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }

});

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1) Get user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpire: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfrim = req.body.passwordConfrim;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    // 3) Update changePassowordAt property for the user
    

    // 4) Log the user in, send JWT
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });

    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync( async (req, res, next) => {
    // 1) Get user from collection 
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if POSTed current password is correct 
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }
    // 3) If so, updated password
    user.password = req.body.password;
    user.passwordConfrim = req.body.passwordConfrim;
    await user.save();
    // User.findByIdUpdate will NOT work as intended!
    
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);

});