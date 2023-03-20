const USER_TRANSACTION_ACTION = {
    DEPOSIT: "deposit",
    REVERT_TRANSACTION: "revert_transaction",
    SIGN_CONTRACT: "sign_contract",
    WITHDRAW: "withdraw",
    PAYMENT: "payment"
};

const ACTION_FUNCTION = {
    [USER_TRANSACTION_ACTION.DEPOSIT]: "plus",
    [USER_TRANSACTION_ACTION.PAYMENT]: "plus",
    [USER_TRANSACTION_ACTION.REVERT_TRANSACTION]: "plus",
    [USER_TRANSACTION_ACTION.WITHDRAW]: "minus",
    [USER_TRANSACTION_ACTION.SIGN_CONTRACT]: "minus",
};

module.exports = {
    USER_TRANSACTION_ACTION,
    ACTION_FUNCTION,
};
