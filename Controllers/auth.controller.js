const allUser = require('../Modals/register.modal')
const mongoose = require('mongoose')

const registerUser = (req, res) => {
    const { firstName, lastName, phone, email, password } = req.body;
    allUser.findOne({ email }).then((userByEmail) => {
      if (userByEmail) {
        console.log(userByEmail);
        res.status(200).json({ message: "Email already exists" });
      } else {
        allUser.findOne({ phone }).then((userByPhone) => {
          if (userByPhone) {
            console.log(userByPhone);
            res.status(200).json({ message: "Phone number already exists" });
          } else {
            let newUser = new allUser({ firstName, lastName, phone, email, password, membership:false, type:"none",uniqueAccNo:'null' });
            newUser.save()
              .then(() => {
                console.log('Successfully signed up:', newUser);
                res.status(200).json({ status: true, message: "Successfully signed up", user: newUser });
              })
              .catch((err) => {
                console.error('Error saving user:', err);
                res.status(500).json({ status: false, message: "Error signing up", error: err });
              });
          }
        }).catch((err) => {
          console.error('Error finding user by phone:', err);
          res.status(500).json({ status: false, message: "Error finding user by phone", error: err });
        });
      }
    }).catch((err) => {
      console.error('Error finding user by email:', err);
      res.status(500).json({ status: false, message: "Error finding user by email", error: err });
    });
  };
  
  const loginMember= async(req, res)=>{
    const {email, password} = req.body
    console.log(password);
    let user = await allUser.findOne({email})
    if(user){
        let validPassword = await user.comparePassword(password)
        if(validPassword){
          console.log('User found');
          // let token = jwt.sign({ email }, SECRET, { expiresIn: "1h" })
          res.send({ status: true, message: "User found", loggedInUser:user._id });
        }else{
          res.send({message:"Invalid password", status:false})
        }
    }else{
      res.send({message:"User not found", status:false})
    }
  }

module.exports = {registerUser, loginMember}