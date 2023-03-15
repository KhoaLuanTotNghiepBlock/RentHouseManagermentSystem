const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = 3000;

const { vnp_TmnCode } = process.env;
const { vnp_HashSecret } = process.env;
let { vnp_Url } = process.env;
const { vnp_ReturnUrl } = process.env;
// Define the endpoint for creating a payment URL
app.get('/create-payment-url', async (req, res) => {
  // Set up the VNPay API parameters
  
  const tmnCode = vnp_TmnCode; // Replace with your VNPay TMN code
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // Replace with the VNPay URL (sandbox or production)
  const secretKey = vnp_HashSecret // Replace with your VNPay secret key
    const  ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  // Get the payment amount from the request query parameters
  const paymentAmount = 1000;

  // Generate the VNPay payment parameters
  const vnpParams = {
    vnp_Version: '2.0.0',
    vnp_TmnCode: tmnCode,
    vnp_Amount: paymentAmount * 100, // Convert to VNPay currency unit (VND)
    vnp_Command: 'pay',
    vnp_CreateDate: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format: yyyy-MM-dd HH:mm:ss
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ipAddr,
    vnp_Locale: 'vn',
    vnp_OrderInfo: 'Payment for your order', // Replace with your order information
    vnp_ReturnUrl: vnp_ReturnUrl, // Replace with your return URL
    vnp_TxnRef: crypto.randomBytes(16).toString('hex'), // Generate a random transaction reference ID
  };

  // Generate the VNPay secure hash
  const vnpSecureHash = crypto.createHmac('SHA256', secretKey)
    .update(Object.keys(vnpParams)
      .sort()
      .map((key) => `${key}=${vnpParams[key]}`)
      .join('&'))
    .digest('hex');

  // Add the VNPay secure hash to the payment parameters
  vnpParams.vnp_SecureHashType = 'SHA256';
  vnpParams.vnp_SecureHash = vnpSecureHash;

  // Create the VNPay payment URL
  const vnpPaymentUrl = `${vnpUrl}?${Object.keys(vnpParams)
    .map((key) => `${key}=${encodeURIComponent(vnpParams[key])}`)
    .join('&')}`;

  // Return the payment URL to the client
  res.json({ paymentUrl: vnpPaymentUrl });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
