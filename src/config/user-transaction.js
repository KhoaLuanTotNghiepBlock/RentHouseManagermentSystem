const USER_TRANSACTION_ACTION = {
    DEPOSIT: "deposit",
    REVERT_TRANSACTION: "revert_transaction",
    SIGN_CONTRACT: "sign_contract",
    WITHDRAW: "withdraw",
    PAYMENT: "payment",
    PENALTY: 'penalty',
    PAY_FOR_RENT: 'pay_for_rent'
};

const ACTION_FUNCTION = {
    [USER_TRANSACTION_ACTION.DEPOSIT]: "plus",
    [USER_TRANSACTION_ACTION.PAYMENT]: "plus",
    [USER_TRANSACTION_ACTION.REVERT_TRANSACTION]: "plus",
    [USER_TRANSACTION_ACTION.WITHDRAW]: "minus",
    [USER_TRANSACTION_ACTION.SIGN_CONTRACT]: "minus",
    [USER_TRANSACTION_ACTION.PENALTY]: "minus",
    [USER_TRANSACTION_ACTION.PAY_FOR_RENT]: "minus",
};

module.exports = {
    USER_TRANSACTION_ACTION,
    ACTION_FUNCTION,
};
