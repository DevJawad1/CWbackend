const Flutterwave = require("flutterwave-node-v3");
const registerSchema = require('../Modals/register.modal')
const collectedWebHookModel = require('../Modals/transaction.modal')
const bcrypt = require('bcrypt')
const createFlw = async (req, res) => {
    const flw = new Flutterwave(
        process.env.FLW_PUBLIC_KEY,
        process.env.FLW_SECRET_KEY
    );

    // res.send("ddndjmd,")
    // console.log(req.body);
    const { user, collectAmount } = req.body;
    try {
        const user = await registerSchema.findOne({ _id: user })
        // console.log(user);

        if (!user) {
            console.log("User not found!");
            return res.json({ message: "User not found!" });
        } else if (user) {
            function generateRandomNumber(length) {
                let randomNumber = "";
                const numbers = "0123456789";

                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * numbers.length);
                    randomNumber += numbers[randomIndex];
                }

                return randomNumber;
            }

            const randomNum = generateRandomNumber(30);
            console.log(randomNum);

            const checkTxf = await collectedWebHookModel.find()

            let collectRef; // Declare collectRef outside the loop

            checkTxf.forEach((transaction) => {
                // console.log(transaction.transactionDetails.data.tx_ref);
                const transactionRef = transaction.transactionDetails.data.tx_ref;

                if (transactionRef === randomNum) {
                    collectRef = transactionRef;
                }
            });

            console.log("CollectRef", collectRef);
            if (collectRef != undefined) {
                generateRandomNumber();
                console.log("undefined");
            }
            else {
                const payload = {
                    email: user.email,
                    is_permanent: false,
                    tx_ref: randomNum,
                    amount: collectAmount,
                    narration: `${user.firstName} ${user.lastName} auto wash`,
                };

                console.log(payload);

                const response = await flw.VirtualAcct.create(payload);
                console.log(response);
                const { bank_name, account_number, created_at, expiry_date } =
                    response.data;

                // Format createdAt
                const createdDate = new Date(created_at);
                let localDateCreated = createdDate.toLocaleString();

                const createdHour = createdDate.getHours();
                if (createdHour > 12) {
                    const formattedHour = createdHour + 1; // Add 1 if hour is greater than 12
                    const ampm = "PM";
                    localDateCreated = `${formattedHour}:${(createdDate.getMinutes() < 10 ? "0" : "") +
                        createdDate.getMinutes()
                        } ${ampm}`;
                }

                // Format expire_date
                const expireDate = new Date(expiry_date);
                let localExpireDate = expireDate.toLocaleString();

                const expireHour = expireDate.getHours();
                if (expireHour > 12) {
                    const formattedHour = expireHour + 1; // Add 1 if hour is greater than 12
                    const ampm = "PM";
                    localExpireDate = `${formattedHour}:${(expireDate.getMinutes() < 10 ? "0" : "") +
                        expireDate.getMinutes()
                        } ${ampm}`;
                }

                const bank = {
                    accountName: user.firstName + " "+ user.lastName,
                    accountNumber: account_number,
                    bankName: bank_name,
                    createdAt: localDateCreated,
                    expire_date: localExpireDate,
                    tx_ref: randomNum,
                    cAt: collectAmount,
                };
                console.log("bank", bank);
                console.log(account_number, 1112);
                user.uniqueAccNo = account_number;
                // user.virtualAccount = bank;
                let updateuser = await user.save();
                console.log(updateuser, "updated");
                if (updateuser) {
                    console.log(user.uniqueAccNo, user.virtualAccount, "ddhjjj");
                    console.log("Account created Successfully");
                    return res.json({ message: "Account created Successfully", bank });
                } else {
                    console.log("Account is not create");
                    return res.json({ message: "Account is not create", });
                }
            }
        }
    } catch (err) {
        // console.error(err);
        console.error(err.response);
    }
};


const WebHook = async (req, res) => {
    console.log("Web is hooking");
    //   console.log(req.body);
    //   console.log(req.body.data.customer);

    try {
        // Extract necessary data from the request body
        const eventData = req.body;

        // Create a new document using the WebhookModel
        const transaction = new collectedWebHookModel({
            transactionDetails: eventData,
        });

        console.log("Transaction", transaction);

        // Save the new document to the database
        await transaction.save();

        // Respond with success message
        res.status(200);

        res.send({ message: "Webhook data saved successfully", status: true });
    } catch (error) {
        // Handle errors
        console.error("Error saving webhook data:", error);
        res
            .status(500)
            .send({ message: "Error saving webhook data", status: false });
    }
};
module.exports = { createFlw, WebHook }