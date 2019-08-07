require('dotenv/config');
let email = require('../sendEmail');

email(process.env.GMAIL2, "HI", "how are you");