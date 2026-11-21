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
    github: {
        repository_url: { type: String, trim: true },
        repo_name: { type: String, trim: true },
        readme: { type: String, trim: true },  
        description: { type: String, trim: true },
        stars: { type: Number, min: 0 },
        main_language: { type: String, trim: true },
        last_commit_date: { type: Date },
        creation_date: { type: Date },
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
        return returnedObject;
    }
});


module.exports = mongoose.model('Project', ProjectSchema);