import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const commentSchema = new Schema({
    username: { type: String, required: true },
    content: { type: String, required: true, max: 50 },
    time: { type: String, required: true },
}, {
    collection: "Comment",
    timestamps: true,
})

const Comment = mongoose.model("Comment", commentSchema);
export default Comment