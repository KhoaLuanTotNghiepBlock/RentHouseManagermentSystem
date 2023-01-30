const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Types.ObjectId;
const authSchema = require('../shema/auth');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: false
    },
    phone: {
        type: String,
        default: ""
    },
    identity: {
        type: String,
        require: true
    },
    auth: authSchema,
    name: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        enum: ['Man', 'Female', 'Other'],
        default: 'Other'
    },
    dob: {
        type: Date,
        default: null
    },
    avatar: {
        type: String,
        default: ""
    },
    notifications: [
        {
            type: ObjectId,
            ref: 'Notification'
        }
    ],
    roles: {
        type: String,
        enum: ['LANDLORD', 'TENANT'],
        default: 'TENANT'
    },
    enable: {
        type: Boolean,
        default: true
    },
    otp: String,
    otpTime: Date,
    socketId: {
        type: String,
        default: "",
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

UserSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: ['find', 'findOne', 'aggregate']
});

UserSchema.plugin(Timezone);

UserSchema.statics.checkByIds = async (ids) => {
    for (const idEle of ids) {
        console.log("🚀 ~ file: user.model.js ~ line 98 ~ UserSchema.statics.checkByIds= ~ idEle", idEle)

        const user = await User.findOne({
            _id: idEle,
            isActived: true
        });

        if (!user) throw new Error('Not found user');
    }
};

UserSchema.statics.checkById = async (_id) => {
    const user = await User.findOne({ _id, isActived: true });

    if (!user) throw new Error('not found user');

    return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;