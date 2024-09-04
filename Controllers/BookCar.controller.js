const bookcarDB = require('../Modals/bookcar.modal')

const saveBookCar = (req, res)=>{
    const {user, allcars} = req.body


    const promises = allcars.map((car, i)=>{
        let carObj = {
            carId:car.carId,
            owner:user,
            location:car.location,
            picked:false,
            delivered:false
        }

        const savecar = new bookcarDB (carObj) 
        return savecar.save();
    })


    Promise.all(promises)
    .then((savedCars) => {
        console.log(savedCars);
        res.send({msg: `Your car${allcars.length > 1 ? 's' : ''} have been booked successfully, we are going to pick them up`,status: true });
    })
    .catch((err) => {
        console.log('Error while saving book car', err);
        res.send({msg: "Oops, something went wrong. Try again in a few minutes.", status: false});
    });
}

module.exports = {saveBookCar}