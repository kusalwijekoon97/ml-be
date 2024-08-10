// utils/emailTransporter.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter
let emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = emailTransporter;
