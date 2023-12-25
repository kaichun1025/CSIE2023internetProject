import fs from 'fs'
import path from 'path'
import ejs, { render } from 'ejs'

const validatePattern = /^(\/stream\?wantvideo=.*)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const streamPage = (req, res, handlerOptions) => {
    if (!isValidUrl(req.url)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
    } else if (req.method === 'GET') {
        const baseURL = req.protocol + '://' + req.headers.host + '/'
        const reqURL = new URL(req.url, baseURL)
        if (req.url.startsWith('/stream?wantvideo=')) {
            const wantvideo = reqURL.searchParams.get('wantvideo')
            if (!wantvideo) {
                replyMessage(res, 400, 'Invalid query, try again')
            } else {
                const url = '/stream/stream.ejs'
                const filePath = path.join(handlerOptions.dirname, 'public', url)
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' })
                        res.end('Not Found')
                    } else {
                        const videosrc = `/stream/source_m3u8/${wantvideo}/output.m3u8`
                        const renderedHTML = ejs.render(data, { videosrc })
                        res.writeHead(200, { 'Content-Type': 'text/html' })
                        res.end(renderedHTML)
                    }
                })
            }
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}

export default streamPage

const replyMessage = (res, status, message, header, content) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...header })
    res.end(JSON.stringify({ message: message, ...content }))
}