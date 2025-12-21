import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    youtubeId: {
        type: String,
        required: [true, 'YouTube video ID is required'],
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
    },
    tutorName: {
        type: String,
        default: 'Rahul Sir',
        trim: true,
    },
    duration: {
        type: String,
        default: '10:00',
    },
    subject: {
        type: String,
        enum: ['MATH', 'REASONING', 'GK', 'ENGLISH', 'QUANT', 'BANKING', 'COMPUTER', 'GENERAL'],
        required: true,
    },
    topics: [{
        type: String,
        trim: true,
    }],
    views: {
        type: String,
        default: '0',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Virtual for thumbnail URL
videoSchema.virtual('thumbnailUrl').get(function () {
    return `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
});

// Virtual for watch URL
videoSchema.virtual('watchUrl').get(function () {
    return `https://www.youtube.com/watch?v=${this.youtubeId}`;
});

// Ensure virtuals are included in JSON
videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;
