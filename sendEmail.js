var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPW
  }
});

function email(receiver, subject, msg){
    var mailOptions = {
      from: process.env.GMAIL,
      to: receiver,
      subject: subject,
      text: msg,
    };
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

module.exports = email;