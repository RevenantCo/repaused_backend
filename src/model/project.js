const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    graveyard: {
        type: Schema.Types.ObjectId,
        ref: 'Graveyard',
        required: true,
    },
    name: {
        type: String,
        required: 'Name is required',
        trim: true,
    },
    epitaph: {
        type: String,
        required: 'Epitaph is required',
        trim: true,
    },
    description: {
        type: String,
        required: 'Description is required',
        trim: true,
    },
}, {
    collection: 'projects',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ProjectSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (document, returnedObject) => {
        delete returnedObject._id;
        delete returnedObject.__v;
        return ret;
    }
});


module.exports = mongoose.model('Project', ProjectSchema);