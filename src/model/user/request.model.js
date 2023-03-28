const mongoose = require('mongoose');
const MyError = require('../../exception/MyError');
const ObjectId = mongoose.Types.ObjectId;

const RequestSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['CANCEL_REQUEST'],
            required: true,
            default: 'CANCEL_REQUEST'
        },
        data: {},
        from: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

RequestSchema.plugin(Timezone);
RequestSchema.statics.getById = async (requestId, projection = {}) => {
    const request = await Request.findById(requestId)
        .populate([
            {
                path: 'from',
                select: "_id username avatar phone email wallet"
            },
            {
                path: 'to',
                select: "_id username avatar phone email wallet"
            }
        ]).projection();
    if (!request)
        throw new MyError('request not found');

    return request;
}
const Request = mongoose.model('Request', RequestSchema);
module.exports = Request;