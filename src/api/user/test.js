var https = require('follow-redirects').https;
var fs = require('fs');

const BASE_URL = "https://k3yq9e.api.infobip.com";
const API_KEY = "App b689fe5d2cce3491a9918f468354eca4-9ea84ff5-f786-4213-829a-dd89647be5c5";
const MEDIA_TYPE = "application/json";

const SENDER = "InfoSMS";
const RECIPIENT = "84972347165";
const MESSAGE_TEXT = "This is a otp";

var options = {
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

var req = https.request(options, function (res) {
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
    });
});

var postData = JSON.stringify({
    "messages": [
        {
            "destinations": [
                {
                    "to": RECIPIENT
                }
            ],
            "from": SENDER,
            "text": MESSAGE_TEXT
        }
    ]
});

req.write(postData);

req.end();