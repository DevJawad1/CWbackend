const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const codeSchema = mongoose.Schema({
    code: String,
    type: String,
    user: String,
})


codeSchema.pre("save", function (next) {
    if (this.isModified("code") || this.isNew) {
        bcrypt.hash(this.code, 10, (err, hash) => {
            if (err) {
                console.log('error occur when hashing code ', err);
            } else {
                this.code = hash;
                console.log(this.code, ' code hash');
                next()
            }
        })
    }
})

codeSchema.methods.compareCode = async function (userCode) {
    try {
        const user = await bcrypt.compare(userCode, this.code);
        return user;
    } catch (err) {
        console.error(err);
        return false;
    }
}
const codemodel = mongoose.model('allcode', codeSchema)

module.exports = codemodel
