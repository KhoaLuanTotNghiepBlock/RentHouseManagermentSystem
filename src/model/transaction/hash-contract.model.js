const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const NotFoundError = require("../../exception/NotFoundError");
const Contract = require("./contract.model");
const MyError = require("../../exception/MyError");
const ObjectId = mongoose.Types.ObjectId;

const hashContractSchema = new mongoose.Schema(
    {
        contractId: {
            type: ObjectId,
            required: true,
            ref: 'Contract'
        },
        hash: {
            type: String
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

hashContractSchema.plugin(Timezone);

hashContractSchema.statics.getByContractId = async (contractId) => {
    const hashContract = await hashContract.findOne({ hash });

    if (!hashContract)
        throw new NotFoundError('Hash contract not found');
    return hashContract;
};

hashContractSchema.statics.getByHash = async (hash) => {
    const hashContract = await hashContract.findOne({ contractId: contractId });

    if (!hashContract)
        throw new NotFoundError('Hash contract not found');
    return hashContract;
};
const HashContract = mongoose.model("HashContract", hashContractSchema);
module.exports = HashContract;