/**
 * Importing mongoose for MongoDB connection
 */
const mongoose = require("mongoose");

/**
 * Credentials for my MongoDB database to 
 * establish an authorized connection
 */
const username = encodeURIComponent("lladas");
const password = encodeURIComponent("Chippie_0805");
const mongoUrl = `mongodb+srv://${username}:${password}@cluster0.5zzqisk.mongodb.net/?retryWrites=true&w=majority`;

/**
 * Connection begins for MongoDB
 */
mongoose.connect(mongoUrl, {
  useNewUrlParser: true
}).then(() => {
  console.log("Connected to the database");
}).catch(err => {
  console.log(err);
});

/**
 * Defining schema layout for a user on my 
 * website that will be stored in MongoDB
 */
const newSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  accountname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  token: {
    type: String,
    default: '',
    required: false
  },
  following: [{
    entity_id: { type: mongoose.Schema.Types.ObjectId },
    entity_type: { type: String, enum: ['user', 'album', 'genre'] }
  }]
});

/**
 * Creating collection model which allows user database to 
 * have CRUD actions when imported in the server routes
 */
const collection = mongoose.model("collection", newSchema);

/**
 * Getting the current date and time to be used as a data value in reviews
 */
const currentDate = new Date(); 

/**
 * Defining schema for a review on my website that will be placed in MongoDB
 */
const reviewSchema = new mongoose.Schema({
  albumId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  reviewbody: {
    type: String,
    default: '',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now, 
    required: false
  }
});

/**
 * Creating reviews model so that we can perform CRUD actions in the server routes when imported
 */
const reviews = mongoose.model("reviews", reviewSchema);

/**
 * Exporting 'collection' and 'reviews' models for future imports in the server routes
 */
module.exports = {
  collection,
  reviews,
};
