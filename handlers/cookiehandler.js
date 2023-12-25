import Session from '../models/session.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

const cookieHandler = {
    setCookies: async (user) => {
        //console.log(expireDate.toUTCString())
        //console.log(user)
        if (!user) return ''
        const expireDate = new Date(Date.now() + 1000 * 60 * 60).toUTCString()
        const newSession = new Session({
            sessionID: crypto.randomBytes(16).toString('hex'),
            userID: user.userID,
            username: user.username,
        })
        const sessionExist = await Session.findOne({sessionID: newSession.sessionID})
        // if(sessionExist) {
        //     await sessionExist.updateOne()
        // }
        try {
            await newSession.save()
            return { 'Set-Cookie': `session=${newSession.sessionID}; Expires=${expireDate}; httpOnly=true` }
        } catch (e) {
            console.error(e)
        }
    },
    searchSessions: async (sessionID) => {
        const session = await Session.findOne({ sessionID: sessionID })
        return session
    },
    parseCookies: (cookieString) => {
        const cookies = {};
        cookieString.split(';').forEach(cookie => {
            const [key, value] = cookie.trim().split('=');
            cookies[key] = value;
        });
        return cookies;
    },
    deleteSession: async (sessionID) => {
        await Session.deleteOne({sessionID: sessionID})
                .then( console.log(`User with sessionID: ${sessionID} has logged out`))
                .catch((err) => {
                    console.error(err)
                })
    },
    removeCookie: () => {
        const expireDate = new Date(0)
        return { 'Set-Cookie': `session=; Expires=${expireDate}; httpOnly`}
    }

}

export default cookieHandler