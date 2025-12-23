import mongoose from 'mongoose';

const LectureSchema = new mongoose.Schema({
    lectureNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    youtubeLink: {
        type: String,
        required: true
    },
    duration: {
        type: String // Optional: "45 mins", "1 hr 20 mins"
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true
    },
    thumbnail: {
        type: String, // URL or Base64 thumbnail image
        default: ''
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    batchName: {
        type: String,
        required: [true, 'Batch name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    lectures: [LectureSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Virtual for lecture count
CourseSchema.virtual('lectureCount').get(function () {
    return this.lectures ? this.lectures.length : 0;
});

// Ensure virtuals are included in JSON
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

export default mongoose.model('Course', CourseSchema);
