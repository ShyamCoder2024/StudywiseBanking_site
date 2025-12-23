import mongoose from 'mongoose';

const globalTaskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    tag: {
        type: String,
        required: true,
        default: 'General'
    },
    createdBy: {
        type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for demo
        default: null
    },
    completedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const GlobalTask = mongoose.model('GlobalTask', globalTaskSchema);

export default GlobalTask;
