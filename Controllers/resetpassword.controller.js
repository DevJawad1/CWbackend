const allUser = require('../Modals/register.modal')

function generateRandomSixDigit() {
    return Math.floor(100000 + Math.random() * 900000);
}
const codeHandler = async(req, res)=>{
    const {email} = req.body
    const user =  await allUser.findOne({email:email})
    if(user){
        const sixDigit = generateRandomSixDigit()
        
    }else{
      console.log("null")
      res.send({msg:"Email not found or not registered, check the email and try again", status:false})
    }
}


module.exports = {codeHandler}