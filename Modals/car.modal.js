const mongoose = require ('mongoose')

const carSchema=mongoose.Schema({
    image:String,
    name:String,
    plateNum:String,
    color:String,
    location:String,
    owner:String,
})

let carModel = mongoose.model("allCar", carSchema)
module.exports = carModel