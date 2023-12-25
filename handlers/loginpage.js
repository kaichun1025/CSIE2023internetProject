import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'
import User from '../models/user.js'
import { v4 as uuidv4 } from 'uuid'
import cookieHandler from './cookiehandler.js'
import ejs from 'ejs'

const validatePattern = /^(\/login|\/regi|\/login\/login\.css|\/login\/login\.js|\/login\?.*)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const loginPage = (req, res, handlerOptions) => {
    if (!isValidUrl(req.url)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });  
        res.end('Not Found');
    } else if (req.method === 'GET') {
        const url = (req.url === '/login' || req.url.startsWith('/login?')) ? '/login/login.ejs' : req.url === '/regi' ? '/login/regi.ejs' : req.url;
        const filePath = path.join(handlerOptions.dirname, 'public', url);
        let contentType = 'text/html';
        switch (path.extname(req.url)) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
        }
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data)
            }
        })
    } else if (req.method === 'POST') {

        bodyParser.json()(req, res, async () => {
            //console.log(req.header)
            //console.log(req.headers)
            const postData = req.body;
            const { username, password } = postData;
            //console.log(username, password)
            if (req.url === '/regi') {
                const newUser = new User({
                    userID: uuidv4(),
                    username: username,
                    password: password,
                })
                await CreateNewUser(res, newUser)

            } else if (req.url === '/login') {
                await UserLogin(res, { username, password }, handlerOptions)
            }
        })
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}
const replyMessage = (res, status, message, header , content) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...header })
    res.end(JSON.stringify({ message: message , ...content}))
}
const CreateNewUser = async (res, newUser) => {
    const nameTaken = await User.findOne({ username: newUser.username })
    if (nameTaken) {
        replyMessage(res, 200, "nameTaken")
    } else {
        try {
            await newUser.save()
            replyMessage(res, 200, 'Successfully Signed Up', { } , {redirect: '/login'})
        } catch (e) {
            replyMessage(res, 500, 'Fail to Create')
            console.error(e)
        }
    }
}
const UserLogin = async (res, userInfo, handlerOptions) => {
    const { username, password } = userInfo
    //console.log(username , password)
    const user = await User.findOne({ username });
    if (!user) {
        replyMessage(res, 200, 'NoUser')
    } else {
        user.comparePassword(password, async (err, isMatch) => {
            if (err) throw new Error(err)
            if (isMatch) {
                const cookieHeader = await cookieHandler.setCookies(user)
                replyMessage(res, 200, 'Successfully Login', { ...cookieHeader } , {redirect: '/'})
            }
            else
                replyMessage(res, 200, 'pswWrong')

        })
    }
}

export default loginPage;