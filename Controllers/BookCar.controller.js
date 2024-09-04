const bookcarDB = require('../Modals/bookcar.modal')

const saveBookCar = (req, res)=>{
    const {user, allcars} = req.body


    allcars.map((car, i)=>{
        let carObj = {
            carId:car.carId,
            owner:user
        }
    })
}