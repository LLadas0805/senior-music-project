const mongoose = require("mongoose")
const mongoUrl = "mongodb+srv://lladas:Chippie_0805@cluster0.5zzqisk.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoUrl, {
  useNewUrlParser:true
}).then(()=>{console.log("Connected to database");})
.catch(e=>console.log(e))



const newSchema=new mongoose.Schema({
    username:{
        type: String,
        required:true
    },
    accountname:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    token: {
        type: String,
        default: '',
        required:false
    },
    following: [
        {
            entity_id: { type: mongoose.Schema.Types.ObjectId },
            entity_type: { type: String, enum: ['user', 'album', 'genre'] }
        }
    ]
})


const collection = mongoose.model("collection", newSchema)
const currentDate = new Date(); // Get the current date and time


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
  
    // Other fields related to reviews
});

const reviews = mongoose.model("reviews", reviewSchema);




module.exports={
    collection,
    reviews,
   
};