const nodemailer = require('nodemailer');
const sendMessageToEmail = (content, mail, title) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      }
    });
  
    var mailOptions = {
      from: process.env.USER_EMAIL,
      to: mail,
      subject: 'iMARKET ' + title,
      html: content
    };
    // transport
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        return true
      }
    });
}

module.exports = { sendMessageToEmail};