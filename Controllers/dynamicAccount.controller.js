const Flutterwave = require("flutterwave-node-v3");
const registerSchema = require('../Modals/register.modal')
const collectedWebHookModel = require('../Modals/transaction.modal')

const createFlw = async (req, res) => {
    const flw = new Flutterwave(
        process.env.FLW_PUBLIC_KEY,
        process.env.FLW_SECRET_KEY
    );

    const { userid, collectAmount } = req.body;
    try {
        const user = await registerSchema.findOne({ _id: userid })
        if (!user) {
            return res.json({ message: "User not found!" });
        }

        const generateRandomNumber = (length) => {
            let randomNumber = "";
            const numbers = "0123456789";
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * numbers.length);
                randomNumber += numbers[randomIndex];
            }
            return randomNumber;
        };

        let randomNum = generateRandomNumber(30);
        const checkTxf = await collectedWebHookModel.find();

        let collectRef; // Declare collectRef outside the loop
        checkTxf.forEach((transaction) => {
            const transactionRef = transaction.transactionDetails.data.tx_ref;
            if (transactionRef === randomNum) {
                collectRef = transactionRef;
            }
        });

        if (collectRef !== undefined) {
            randomNum = generateRandomNumber(30);
        } else {
            const payload = {
                email: user.email,
                is_permanent: false,
                tx_ref: randomNum,
                amount: collectAmount,
                narration: `${user.firstName} ${user.lastName} auto wash`,
            };

            const response = await flw.VirtualAcct.create(payload);
            const { bank_name, account_number, created_at, expiry_date } = response.data;

            const formatDateTime = (dateTime) => {
                const date = new Date(dateTime);
                let localDate = date.toLocaleString();
                const hour = date.getHours();
                if (hour > 12) {
                    const formattedHour = hour + 1; // Add 1 if hour is greater than 12
                    const ampm = "PM";
                    localDate = `${formattedHour}:${(date.getMinutes() < 10 ? "0" : "") +
                        date.getMinutes()} ${ampm}`;
                }
                return localDate;
            };

            const bank = {
                accountName: user.firstName + " " + user.lastName,
                accountNumber: account_number,
                bankName: bank_name,
                createdAt: formatDateTime(created_at),
                expire_date: formatDateTime(expiry_date),
                tx_ref: randomNum,
                cAt: collectAmount,
            };
            
            registerSchema.findOneAndUpdate(
                {_id:userid},
                {$set: {uniqueAccNo: account_number}},
                {new:true}
            )
            .then((accountSaved)=>{
                if(accountSaved){
                    res.send({ message: "Account created Successfully", bank });
                }else{
                    res.send({ message: "Account not created" });
                }
            })
            .catch(err=>{
                console.log(err);
            })
            
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
};

const WebHook = async (req, res) => {
    try {
        const eventData = req.body;
        const transaction = new collectedWebHookModel({
            transactionDetails: eventData,
        });

        await transaction.save();
        res.status(200).send({ message: "Webhook data saved successfully", status: true });
    } catch (error) {
        console.error("Error saving webhook data:", error);
        res.status(500).send({ message: "Error saving webhook data", status: false });
    }
};


    
module.exports = { createFlw, WebHook };
