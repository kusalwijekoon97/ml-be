// utils/emailTransporter.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter for Mailtrap
let emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = emailTransporter;
