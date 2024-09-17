const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const codeSchema = mongoose.Schema({
    code:Number,
    type:String,
    user:String,
})


codeSchema.pre("save", function(next){
    if(this.isModified("code")|| this.isNew){
        bcrypt.hash(this.code, 10, (err, hash)=>{
            if(err){
                console.log('error occur when hashing code ', err);
            }else{
                this.code  = hash;
                console.log(this.code, ' code hash');
                next()  
            }
        })
    }
})

codeSchema.methods.comparePassword=async function(userPassword){
    try {
      const user = await bcrypt.compare(userPassword, this.password);
      return user;
    } catch (err) {
      console.error(err);
      return false;
    }
    }
const model = mongoose.model('allcode', codeSchema)