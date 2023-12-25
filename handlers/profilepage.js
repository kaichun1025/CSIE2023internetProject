import fs from 'fs'
import path from 'path'
import ejs from 'ejs'

const validatePattern = /^(\/profile|\/profile\/profile\.css|\/profile\/profile.js|\/profile\/picture.*\.jpg)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const profilePage = (req, res, handlerOptions) => {
    if (req.method === 'GET') {
        if (!isValidUrl(req.url)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            const url = req.url === '/profile' ? '/profile/profile.ejs' : req.url;
            const filePath = path.join(handlerOptions.dirname, 'public', url);
            let contentType = 'text/html';
            switch (path.extname(req.url)) {
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
            }
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    if (req.url === '/profile') {
                        const user = {
                            username: handlerOptions.username
                        }
                        const renderedData = ejs.render(data, { user })
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

export default profilePage;