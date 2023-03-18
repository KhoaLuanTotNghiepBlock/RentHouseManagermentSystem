const { https } = require("follow-redirects");
// const fs = require("fs");

const BASE_URL = "https://k3yq9e.api.infobip.com";
const API_KEY = "App 8ebc3ad16610ebbfd9bcc9a255a81b7f-591f69c2-a030-49a4-8336-3d990b46edc0";
const MEDIA_TYPE = "application/json";

const SENDER = "InfoSMS";
const RECIPIENT = "84961516941";
const MESSAGE_TEXT = "This is a otp";

const options = {
  method: "POST",
  hostname: "k3yq9e.api.infobip.com",
  host: BASE_URL,
  path: "/sms/2/text/advanced",
  headers: {
    Authorization: API_KEY,
    "Content-Type": MEDIA_TYPE,
    Accept: MEDIA_TYPE,
  },
  maxRedirects: 20,
};

const req = https.request(options, (res) => {
  const chunks = [];

  res.on("data", (chunk) => {
    chunks.push(chunk);
  });

  res.on("end", (chunk) => {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", (error) => {
    console.error(error);
  });
});

const postData = JSON.stringify({
  messages: [
    {
      destinations: [
        {
          to: RECIPIENT,
        },
      ],
      from: SENDER,
      text: MESSAGE_TEXT,
    },
  ],
});

req.write(postData);

req.end();
