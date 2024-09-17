const Flutterwave = require("flutterwave-node-v3");
const registerSchema = require('../Modals/register.modal')
const collectedWebHookModel = require('../Modals/transaction.modal')
const { sendMessageToEmail } = require('./mailsending.controller')
const createFlw = async (req, res) => {
    const flw = new Flutterwave(
        process.env.FLW_PUBLIC_KEY,
        process.env.FLW_SECRET_KEY
    );

    const { userid, collectAmount, planType } = req.body;

    try {
        const user = await registerSchema.findOne({ _id: userid });
        if (!user) {
            return res.json({ message: "User not found!" });
        }

        const generateAcc = async () => {
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
            const checkTxf = await collectedWebHookModel.find().select('+transactionDetails');
            checkTxf.forEach((transaction) => {
                if (transaction.transactionDetails && transaction.transactionDetails.data) {
                    const transactionRef = transaction.transactionDetails.data.tx_ref;
                    if (transactionRef === randomNum) {
                        randomNum = generateRandomNumber(30);
                    }
                }
            });

            const payload = {
                email: user.email,
                is_permanent: false,
                tx_ref: randomNum,
                amount: collectAmount,
                narration: `${user.firstName} ${user.lastName} auto wash`,
            };

            const response = await flw.VirtualAcct.create(payload);
            if (response && response.data) {
                const { bank_name, account_number, created_at, expiry_date } = response.data;

                const formatDateTime = (dateTime) => {
                    const date = new Date(dateTime);
                    return date.toLocaleString(); // Simplify format to just local date-time
                };

                const bank = {
                    accountName: `${user.firstName} ${user.lastName}`,
                    accountNumber: account_number,
                    bankName: bank_name,
                    createdAt: formatDateTime(created_at),
                    expire_date: formatDateTime(expiry_date),
                    tx_ref: randomNum,
                    cAt: collectAmount,
                    type: user.type == "none" ? "Get plan" : user.type == "third" && collectAmount > 100 ? "Upgrade plan" : user.type == "second" && collectAmount > 500 ? "Upgrade plan" : "Renew plan"
                };

                const updatedAccount = await registerSchema.findOneAndUpdate(
                    { _id: userid },
                    { $set: { uniqueAccNo: account_number } },
                    { new: true }
                );

                if (updatedAccount) {
                    return res.send({ message: "Account created Successfully", bank, status: true });
                } else {
                    return res.send({ message: "Account not created" });
                }
            } else {
                console.error("Unexpected response from Flutterwave API:", response);
                return res.status(500).json({ error: "Failed to create virtual account. Please try again later." });
            }
        };

        const findTransaction = await collectedWebHookModel.find({ email: user.email });

        if (findTransaction.length > 0) {
            let today = new Date();

            function isDateGreaterThanToday(inputDate) {
                let givenDate = new Date(inputDate);
                return givenDate > today;
            }

            for (let trsc of findTransaction) {
                if (trsc.currently === true && isDateGreaterThanToday(trsc.dueDate)) {
                    return res.send({
                        msg: `You have an ongoing plan. Wait till ${trsc.dueDate} before you can renew or upgrade plan`
                    });
                }
            }

            // If no ongoing plan is found, create a new account
            await generateAcc();
        } else {
            // No previous transactions, create a new account
            await generateAcc();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
    }
};


const WebHook = async (req, res) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);

        function isEmpty(obj) {
            return Object.keys(obj).length === 0;
        }

        if (isEmpty(req.body)) {
            console.warn('Empty webhook data received');
            return res.status(400).send({ message: "Webhook data is empty" });
        }

        // Process the webhook data
        const eventData = req.body;
        const dueDate = (realDate) => {
            let date = new Date(realDate);
            date.setDate(date.getDate() + 30);
            let formattedDate = date.toISOString().split('T')[0];
            return formattedDate
        }
        const transaction = new collectedWebHookModel({
            transactionDetails: eventData,
            resolve: false,
            email: eventData.data.customer.email,
            paymentType: "none",
            dueDate: dueDate(eventData.data.created_at.slice(0, 10)),
            currently: false,
        });

        transaction.save().then((result) => {
            res.status(200).send({ message: "Webhook data saved successfully", status: true });
        }).catch((err) => {
            console.log('errror while saving transaction ', err)
        })
    } catch (error) {
        console.error("Error processing webhook data:", error.message);
        res.status(500).send({ message: "Error processing webhook data", status: false });
    }
};


const verifyUserpayment = async (req, res) => {
    const { tx_ref, userid } = req.body;
    console.log(tx_ref);

    try {
        const webhooks = await collectedWebHookModel.find().select('+transactionDetails');
        let paymentConfirmed = false;

        for (const eachwebhook of webhooks) {
            const data = eachwebhook.transactionDetails?.data;
            eachwebhook.currently = false;

            if (data && data.tx_ref === tx_ref) {
                const payer = data.customer.email;
                const amount = data.amount;
                paymentConfirmed = true;

                const user = await registerSchema.findOne({ email: eachwebhook.email });
                let eventType = "Renew plan";
                if (user) {
                    if (user.type === "none") {
                        eventType = "Get plan";
                    } else if (user.type === "third" && amount > 100) {
                        eventType = "Upgrade plan";
                    } else if (user.type === "second" && amount > 500) {
                        eventType = "Upgrade plan";
                    }
                }

                eachwebhook.paymentType = eventType;
                eachwebhook.resolve = true;
                eachwebhook.currently = true;  // Set 'currently' to true for the matching webhook
                await eachwebhook.save();

                const userUpdate = await registerSchema.findOneAndUpdate(
                    { email: payer },
                    { $set: { membership: true, type: amount === 100 ? "third" : amount === 500 ? "second" : "first" } },
                    { new: true }
                );

                if (userUpdate) {
                    return res.send({ msg: `Payment confirmed, You are now a ${userUpdate.type} class member`, status: true });
                } else {
                    return res.send({ msg: "Payment confirmed, we are working on your membership", status: true });
                }
            }

            await eachwebhook.save();
        }

        if (!paymentConfirmed) {
            res.send({ msg: "We are yet to receive your payment, click after some minutes", status: false });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while verifying payment" });
    }
};


const userPayment = async (req, res) => {
    const { userId } = req.body

    const user = await registerSchema.findOne({ _id: userId })
    const email = user.email

    const UserPayment = await collectedWebHookModel.find({ email: email }).select('+transactionDetails')

    if (UserPayment.length > 0) {
        res.send({ status: true, paymentHistory: UserPayment })
    } else {
        res.send({ status: false, paymentHistory: [] })
    }
}

module.exports = { createFlw, WebHook, verifyUserpayment, userPayment };
