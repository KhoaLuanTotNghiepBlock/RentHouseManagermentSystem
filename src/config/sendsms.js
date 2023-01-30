const dotenv = require('dotenv').config();
var https = require('follow-redirects').https;
var fs = require('fs');

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const MEDIA_TYPE = process.env.MEDIA_TYPE;

const sendMessage = (data) => {
    const options = {
        'method': 'POST',
        'hostname': 'k3yq9e.api.infobip.com',
        'host': BASE_URL,
        'path': '/sms/2/text/advanced',
        'headers': {
            'Authorization': API_KEY,
            'Content-Type': MEDIA_TYPE,
            'Accept': MEDIA_TYPE
        },
        'maxRedirects': 20
    };

    const req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
            throw new Error('Send OTP fail!');
        });
    });

    req.write(data);

    req.end();
    return;
}

module.exports = sendMessage;