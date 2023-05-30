const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.use(cors());

// Setup view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global middleware

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// app.use(helmet());
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "api.mapbox.com"],
//         workerSrc: ["'self'", "api.mapbox.com", "'unsafe-eval'", "blob:"],
//         connectSrc: ["'self'", "api.mapbox.com", "events.mapbox.com"], // Include Mapbox events endpoint as an allowed source
//         },
//     })
// );

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "api.mapbox.com", "cdnjs.cloudflare.com"],
        workerSrc: ["'self'", "api.mapbox.com", "'unsafe-eval'", "blob:"],
        connectSrc: ["'self'", "api.mapbox.com", "events.mapbox.com", "https://api.mapbox.com", "http://127.0.0.1:3000"], // Include 'https://api.mapbox.com' as an allowed source
      },
    })
  );
  
  
  

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests for this IP, please try again in an 1 hour'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json( { limit: '10kb' } ));

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
}); 

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;