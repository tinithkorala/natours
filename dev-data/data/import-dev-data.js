const fs = require('fs');
const mongoose = require('mongoose');
const dontenv = require('dotenv');
const Tour = require('./../../models/tourModel');   

dontenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true
}).then(() => console.log('DB connection successful !'));

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data into db
const importData = async () => {
    try {
        await Tour.create(tours);
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