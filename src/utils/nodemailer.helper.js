const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const engine = require('express-handlebars');

// create instance for handlebar 
const hbs = engine.create({
    extname: '.hbs'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OUR_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


const sendVerify = async ({ to, username, token }) => {
    try {
        let mailOptions = {
            from: process.env.OUR_EMAIL,
            to,
            subject: 'BUGHOUSE Verification Email',
            html: await hbs.render('./src/template/verify_mail.hbs', {
                token,
                username,
                clientDomain: 'http://localhost:3000/bh'
            }),
            attachments: [
                {
                    filename: 'hinh1.jpg',
                    path: '',
                    cid: 'logo_image'
                }
            ]
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err);
            else console.log('Email send:', info.response);
        });
    } catch (err) {
        throw err;
    }
};

module.exports = { sendVerify };