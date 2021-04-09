import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlenght: 1,
        trim: true
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    }
},{
    timestamps: true,
});

const Task = mongoose.model('Task', TaskSchema);

export { Task }