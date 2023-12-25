import fs from 'fs'
import path from 'path'
import Comment from '../models/comment_model.js'
import bodyParser from 'body-parser'
import { URL } from 'url'


const validatePattern = /^(\/comment|\/comment\/comment.css|\/comment\/comment.js|\/api\/comment|\/api\/comment\?.*)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const commentPage = async (req, res, handlerOptions) => {
    if (!isValidUrl(req.url)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    } else if (req.method === 'GET') {
        if (req.url.startsWith('/api/comment?')) {
            const baseURL = req.protocol + '://' + req.headers.host + '/'
            const reqURL = new URL(req.url, baseURL)
            const pagenumber = reqURL.searchParams.get('pagenumber')
            const pagesize = reqURL.searchParams.get('pagesize')

            if (!pagenumber || !pagesize)
                replyMessage(res, 400, 'Invalid fetch, try again')
            else {
                FetchComments(res, pagenumber, pagesize)
            }
        } else {
            const url = req.url === '/comment' ? '/comment/comment.html' : req.url;
            const filePath = path.join(handlerOptions.dirname, 'public', url)
            let contentType = 'text/html'
            //console.log(path)
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
        }
    } else if (req.method === 'POST' && req.url === '/api/comment') {
        bodyParser.json()(req, res, async () => {
            const postData = req.body
            const comment = postData.comment
            console.log(handlerOptions.username, comment)
            const newComment = new Comment({
                username: handlerOptions.username,
                content: comment,
                time: getTime(),
            })

            await CreateNewComment(res, newComment)
        })
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}


export default commentPage


const getTime = () => {
    const curDate = new Date()

    const year = curDate.getFullYear()
    const month = curDate.getMonth() + 1
    const day = curDate.getDate()

    const hour = curDate.getHours()
    const minute = curDate.getMinutes()

    //console.log(`${year}/${month}/${day} ${hour}:${minute}`)

    return `${year}/${month}/${day} ${hour}:${minute}`
}

const replyMessage = (res, status, message, header, content) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...header })
    //console.log(res.getHeaders())
    // console.log(res.statusCode)
    res.end(JSON.stringify({ message: message, ...content }))
}

const CreateNewComment = async (res, newComment) => {
    try {
        await newComment.save()
        replyMessage(res, 200, 'Successfully Commented')
    } catch (e) {
        replyMessage(res, 500, 'Fail to Comment')
        throw new Error(e)
    }
}

const FetchComments = (res, pagenumber, pagesize) => {
    
    Comment.find().sort({ createdAt: -1 }).skip(pagenumber * pagesize).limit(pagesize).exec()
        .then(comments => {
            replyMessage(res, 200, "Successfully fetch", {}, { comments })
        }).catch(e => {
            throw new Error(e)
        })
    
}
