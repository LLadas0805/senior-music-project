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
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    }
})

const collection = mongoose.model("collection", newSchema)

module.exports=collection