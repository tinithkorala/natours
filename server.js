const mongoose = require('mongoose');
const dontenv = require('dotenv');

dontenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true
}).then(() => console.log('DB connection successful !'));

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

// Create a model from the schema
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The park campser',
  price: 500
});

testTour.save()
.then(doc => {
  console.log(doc);
})
.catch(err => {
  console.log('Error ! : ', err);
});

// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
