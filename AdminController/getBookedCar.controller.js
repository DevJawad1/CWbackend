const bookcarDB = require('./Modals/')
const allBookedCar= async(req, res)=>{
    const allBooking  = await bookcarDB.find({})

    const allBookedCarOwner = new Set(allBooking.map(car => car.owner))
    console.log(allBookedCarOwner)

}

module.exports = {allBookedCar}