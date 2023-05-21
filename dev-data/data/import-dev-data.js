const fs = require('fs');
const mongoose = require('mongoose');
const dontenv = require('dotenv');
const Tour = require('./../../models/tourModel');   
const Review = require('./../../models/reviewModel');   
const User = require('./../../models/userModel');   

dontenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true
}).then(() => console.log('DB connection successful !'));

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into db
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully loaded !');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

// Delete all data from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted !');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if(process.argv[2] === '--import') {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}