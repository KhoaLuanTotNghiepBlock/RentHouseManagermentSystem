dotenv = require("dotenv").config();
const _this = {};
_this.ADMIN = {
    _id: process.env.ADMIN_ID,
    username: process.env.ADMIN_USERNAME,
    name: "BUG HOUSE",
    address: process.env.ADMIN_ADDRESS,
    private_key: process.env.ADMIN_PRIVATE_KEY,
};
_this.bugId = "64183444b98701f5a86b9296";

_this.ACTION_TRANSFER = {
    TOP_UP: "top_up",
    WITHDRAW: "withdraw",
    TRANSFER: "transfer",
    CLAIM: "claim",
};
module.exports = _this;
