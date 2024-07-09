const mongoose= require('mongoose')
const bcrypt = require('bcrypt')
const memberSchema =  mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phoneNo:String,
    membership:Boolean,
    type:String,
    password:String,
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
let allUser = mongoose.model("member", memberSchema)
module.exports = allUser