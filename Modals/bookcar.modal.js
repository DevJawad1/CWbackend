const mongoose = require('mongoose')

const bookcarSchema = mongoose.Schema({
    carId:String,
    owner:String,
    location:String,
    picked:{type:Boolean , default:false},
    delivered:{type:Boolean , default:false},
})

const bookCarModal = mongoose.model('Bookedcar', bookcarSchema)

module.exports = bookCarModal