const allUser = require('../Modals/register.modal');
const codeTable = require('../Modals/usercode.modal');
const { sendMessageToEmail } = require('./mailsending.controller');

function generateRandomSixDigit() {
    return Math.floor(100000 + Math.random() * 900000);
}

const codeHandler = async (req, res) => { 
    const { email } = req.body;
    try {
        const user = await allUser.findOne({ email: email });
        if (user) {
            const sixDigit = generateRandomSixDigit();
            const obj = {
                code: sixDigit.toString(),
                type: "Reset password",
                user: email
            };

            const findType = await codeTable.findOneAndDelete({user:email, type:"Reset password"})
            const setcode = new codeTable(obj);
            const savedCode = await setcode.save();
            
            if (savedCode) {
                const html = `
                    <div style="box-shadow: 1px 1px 2px 2px #0e46a139; margin: 20px; padding: 5px; border-radius: 5px">
                        <h5 style="border-bottom: 1px solid gray;">Reset password</h5>
                        <h6 style="font-size: 15px;">
                            Dear <span style="color: green; font-size: 20px;">${user.firstName} ${user.lastName}</span>, 
                            the below digit is the code to reset your password
                        </h6>
                        <h4 style="font-size: 25px;">${sixDigit}</h4>
                        <h6 style="font-size: 15px;">Note: this code will expire in thirty minutes</h6>
                        </div>
                        `;
                        
                const emailSent = await sendMessageToEmail(html, email, 'Reset Password Code');
                res.send({ msg: "Code sent to your email", status: true });
               
            }
        } else {
            res.send({ msg: "Email not found or not registered, check the email and try again", status: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "Internal server error", status: false });
    }
}


const verifyOtp=async(req, res)=>{
    const {email, otp, type } = req.body

    const findOtp = await codeTable.findOne({email, type})
    if(findOtp){
        let validOtp = await findOtp.compareCode(otp.toString())

    }

}

module.exports = { codeHandler, verifyOtp };
