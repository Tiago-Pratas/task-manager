import mongoose from 'mongoose';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

const jwtSecret = '826064w4150knfKSjklsfn7149769649!o489hcb2304500437'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    sessions: [{
        token: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Number,
            required: true,
        }
    }]
}, {
    timestamps: true,
});

//Instace methods

UserSchema.methods.toJson = function() {
    const User = this;
    const userObject = User.toObject();

    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const User = this;
    return new Promise((resolve, reject) => {
        //create JWT and return it
        jwt.sign({
            _id: User._id.toHexString() }, jwtSecret, { expiresIn: "15m" },
        (error, token) => {
            if(!error) {
                resolve(token);
            }
            else {
                reject();
            }
        })
    })
}

UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((result, reject) => {
        crypto.randomBytes(64, (error, buffer) => {
            if (!error) {
                let token = buffer.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function () {
    const user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);})
        .then((refreshToken) => {
            return refreshToken;
        }).catch((e) => {
            return Promise.reject('Failed to save session to DB.\n', + e );
        })
}


//module methods (static methods)
UserSchema.statics.findByIdAndToken = function(_id, token) {
    //finds user by id used in middleware (verifysession)
    const User = this;

    return UserSchema.findOne({
        _id,
        'session.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;

    return User.findOne({
        email,
    }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, res) => {
                if (res) resolve(user);
                else reject();
            })
        })
    })
}

UserSchema.static.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now / 1000;

    if (expiresAt > secondsSinceEpoch) {
        return false;
    }
    else {
        return true;
    }
}

//midlleware (runs before a user doc is saved)
UserSchema.pre('save', function (next) {
    let user = this;

    let costFactor = 10;

    if(user.isModified('password')) {
        //if the password field is modified this runs
        bcrypt.genSalt(costFactor, (error, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            })
        })
    }
    else {
        next();
    }
})


//helper methods
let saveSessionToDatabase = (user, refreshToken) => {
    //save session to db
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({'token': refreshToken, expiresAt});

        user.save().then(() => {
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;

    return((Date.now() / 1000) * secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

export { User }