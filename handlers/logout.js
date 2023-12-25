import cookieHandler from "./cookiehandler.js"


const validatePattern = /^\/logout$/
const isValidUrl = (url) => {
    return validatePattern.test(url)
}
const logoutHandler = (req , res , handlerOptions) => {
    if(!isValidUrl(req.url)){
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    } else if(req.method === 'GET'){
        cookieHandler.deleteSession(handlerOptions.sessionID)
        res.writeHead(200 , { 'Content-Type': 'application/json' ,...cookieHandler.removeCookie()})
        res.end(JSON.stringify({message: "Successfully Logged Out" , redirect: '/login'}))
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Not Allowed');
    }
}
export default logoutHandler