import express from 'express';
import { User } from '../db/models/index.js';


const router = express.Router();

/**
 * POST /users
 * Sign Up
 */

router.post('/', (req, res, next) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return (accessToken, refreshToken)
        }).then((authTokens) => {
            
            //constructand send the res to the user with their tokens in the header and the user object in the body
            res
                .header('x-refesh-auth-token', authTokens.refreshToken)
                .header('x-refesh-auth-token', authTokens.accessToken)
                .send(newUser);
        }).catch((e) => {
            res.status(400).send(e);
        })
    })    
});

/**
 * POST users/login
 * login
 */
router.post('/login', (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {

            return { accessToken, refreshToken }
        })
    }).then((authTokens) => {
        res
                .header('x-refesh-auth-token', authTokens.refreshToken)
                .header('x-refesh-auth-token', authTokens.accessToken)
                .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

export { router }