import mongoose from 'mongoose';

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlenght: 1,
        trim: true
    }, 
}, {
    timestamps: true,
})

const List = mongoose.model('List', ListSchema);


export { List }