const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: "name is required",
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    nickname: {
        type: String,
        required: "nickname is required",
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_-]+$/, 'nickname format is invalid'],

    },
    email: {
        type: String,
        required: 'Email is required',
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"],
    },
    github_username: {
        type: String,
        required: "github username is required",
        unique: true,
        trim: true,
        minlength: 1,
        maxlength: 39,
        match: [/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid github username"],
    },
    // used only for case-insensitive uniqueness
    github_username_lower: {
        type: String,
        unique: true,
        select: false,
    },
    hashed_password: {
        type: String,
        required: "password is required",
    },
    salt: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
},
    {
        collection: 'users',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    });

// This virtual is used to set the password
UserSchema.virtual('password')
    .set(function (password) {

        this.salt = Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64');
        this.hashed_password = this.hashPassword(password);

    });

UserSchema.pre('validate', function () {
    if (this.github_username) {
        this.github_username_lower = this.github_username.toLowerCase();
    }
});

// Exclude soft-deleted users from all find queries unless explicitly included
UserSchema.pre(/^find/, function () {
    if (!this.getOptions().includeDeleted) {
        this.where({ deleted_at: null });
    }
});

// This method is used to hash the password
UserSchema.methods.hashPassword = function (password) {
    return crypto.
        pbkdf2Sync(password, this.salt, 10000, 64, 'sha512')
        .toString('base64');
}

// This method is used to authenticate the user
UserSchema.methods.authenticate = function (password) {
    return this.hashed_password === this.hashPassword(password);
}


// This ensures that virtual are properly serialized in JSON output and not returned in the response
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret.id;
        delete ret._id;
        delete ret.salt;
        delete ret.hashed_password;
        delete ret.github_username_lower;
        delete ret.admin;
        return ret;
    }
})


module.exports = mongoose.model('User', UserSchema);

