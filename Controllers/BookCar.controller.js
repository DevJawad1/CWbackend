const bookcarDB = require('../Modals/bookcar.modal')
const userDB = require('../Modals/register.modal')
const saveBookCar = async(req, res)=>{
    const {user, allcars} = req.body

    const findUser = await userDB.findOne({_id:user})
    if(findUser.type=="none"){
        res.send({msg:"You are not a membeship yet, Go and get one", status:false})
    }else{
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
    
        console.log(promises)
    
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

}

module.exports = {saveBookCar}