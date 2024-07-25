const allUser = require('../Modals/register.modal')

const userDetails= async(req, res)=>{
    // console.log(req.body);
    const user = await allUser.findOne({_id:req.body.id})

    res.send({user})
}

module.exports ={userDetails}