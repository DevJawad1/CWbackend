const mongoose = require("mongoose");

const collectWebhook = new mongoose.Schema({
  transactionDetails: {
    type: Object,
    required: true,
    select: false,
    confirmation: false,
  },
  resolve:Boolean,
  email:String,
  paymentType:String,
  currently:Boolean,
});

const collectedWebHookModel = mongoose.model("webHook", collectWebhook);
module.exports = collectedWebHookModel;