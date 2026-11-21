const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GraveyardSchema = new Schema({
    title: {
        type: String,
        required: 'Title is required',
        trim: true,
        minlength: 1,
        maxlength: 150,
    },
    description: {
        type: String,
        required: 'Description is required',
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    is_public: {
        type: Boolean,
        default: true,
    },

}, {
    collection: 'graveyards',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

GraveyardSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (document, returnedObject) => {
        delete returnedObject._id;
        delete returnedObject.__v;
        return ret;
    }
});


module.exports = mongoose.model('Graveyard', GraveyardSchema);