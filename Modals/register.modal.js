const mongoose= require('mongoose')
const bcrypt = require('bcrypt')
const memberSchema =  mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phone:String,
    membership:Boolean,
    type:String,
    password:String,
    vip:Boolean,
    uniqueAccNo:String
})

memberSchema.pre("save", function(next){
    if(this.isModified("password")|| this.isNew){
        bcrypt.hash(this.password, 10, (err, hash)=>{
            if(err){
                console.log('error occur when hashing password ', err);
            }else{
                this.password  = hash;
                console.log(this.password, ' password hash');
                next()  
            }
        })
    }
})

memberSchema.methods.comparePassword=async function(userPassword){
    try {
      const user = await bcrypt.compare(userPassword, this.password);
      return user;
    } catch (err) {
      console.error(err);
      return false;
    }
    }
let allUser = mongoose.model("member", memberSchema)
module.exports = allUser