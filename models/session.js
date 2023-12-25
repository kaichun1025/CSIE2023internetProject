import { UUID } from 'mongodb'
import mongoose from 'mongoose'

const Schema = mongoose.Schema
const sessionSchema = new Schema({
    sessionID: {type: String , required: true , unique: true},
    userID: {type: String , required: true },
    username: {type: String , required: true},
}, {
    collection: 'session',
    timestamps: true,
})

sessionSchema.index({createdAt: 1} , {expireAfterSeconds: 60*60 })
const Session = mongoose.model("Session" , sessionSchema)
export default Session 