import fs from 'fs'
import path from 'path'
import ejs from 'ejs'

const validatePattern = /^(\/|\/style.css|\/home.js|\/articles)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const homePage = (req, res, handlerOptions) => {
    // const URLS = new Set(['/', '/style.css', '/home.js']);
    if (req.method === 'GET') {
        if (!isValidUrl(req.url)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            const url = req.url === '/' ? '/index.ejs' : req.url;
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
                    if(handlerOptions.username !== ''){
                        const user = {
                            username: handlerOptions.username
                        }
                        const renderedData = ejs.render(data , { user })
                        res.end(renderedData)
                    } else 
                        res.end(data)
                }
            })
        }
        
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}

export default homePage;