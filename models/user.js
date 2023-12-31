import { UUID } from 'mongodb';
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userID : {type: String , required: true , unique: true} ,
    username: {type: String , required: true} ,
    password: {type: String , required: true},
} , 
{
    collection: "User",
})

userSchema.pre('save' , function(next){
    let user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = mongoose.model("User" , userSchema);
export default User