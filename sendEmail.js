var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPW
  }
});

var mailOptions = {
  from: process.env.GMAIL,
  to: process.env.GMAIL2,
  subject: 'test2',
  text: 'That was easy!',
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});