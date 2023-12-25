

const validatePattern = /^(\/api\/curuser)$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}

const curUser = (req, res, handlerOptions) => {
    if (!isValidUrl) {
        console.log(req.url)
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    } else if (req.method === 'GET' && !isEmpty(handlerOptions.username)) {
        //console.log(handlerOptions.username)
        replyMessage(res, 200, "Current User Name", {}, { username: handlerOptions.username })
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}

const replyMessage = (res, status, message, header, content) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...header })
    //console.log(res.getHeaders())
    // console.log(res.statusCode)
    res.end(JSON.stringify({ message: message, ...content }))
}
const isEmpty = (str) => {
    return (!str || str.trim().length === 0);
}
export default curUser 