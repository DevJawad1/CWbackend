const mongoose = require ('mongoose')

const carSchema=mongoose.Schema({
    name:String,
    image:String,
    owner:String
})