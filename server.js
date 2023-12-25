import db from './db.js'
try {
  db.connect();
} catch (e) {
  throw new Error(e)
}

import http from 'http'
import fs, { createReadStream } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import HLSServer from 'hls-server'

import profilePage from './handlers/profilepage.js'
import homePage from './handlers/homepage.js'
import loginPage from './handlers/loginpage.js'
import logoutHandler from './handlers/logout.js';
import cookieHandler from './handlers/cookiehandler.js';
import commentPage from './handlers/commentpage.js';
import curUser from './handlers/curuser.js';
import streamPage from './handlers/streampage.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const handlerOptions = {
    dirname: __dirname,
    sessionID: '',
    userID: '',
    username: '',
  };

  // check if have cookie.
  if (req.headers.cookie && handlerOptions.username === '') {
    const parsedCookies = cookieHandler.parseCookies(req.headers.cookie)
    const session = await cookieHandler.searchSessions(parsedCookies['session'])
    if (session) {
      handlerOptions.sessionID = parsedCookies['session']
      handlerOptions.username = session.username
      handlerOptions.userID = session.userID
    } else {
      replyMessage(res , 303 , "Cookie Error, delete it" , {"Location": '/delete-cookie'} , {redirect: '/delete-cookie'})
      return
    }
  }
  
  // pass to correspond handler
  if (req.url.startsWith('/socket'))
    return
  else if (req.url.startsWith('/stream'))
    streamPage(req , res , handlerOptions)
  else if (req.url.startsWith('/login') || req.url.startsWith('/regi'))
    loginPage(req, res, handlerOptions)
  else if (!req.headers.cookie) 
    replyMessage(res , 303 , "Login First" , {'Location': '/login' , ...cookieHandler.removeCookie()} , {redirect: '/login'})
  else if (req.url.startsWith('/profile'))
    profilePage(req, res, handlerOptions)
  else if (req.url.startsWith('/comment') || req.url.startsWith('/api/comment'))
    commentPage(req, res, handlerOptions)
  else if (req.url.startsWith('/api/curuser'))
    curUser(req, res, handlerOptions)
  else if (req.url.startsWith('/logout'))
    logoutHandler(req, res, handlerOptions)
  else if (req.url === '/delete-cookie')
    replyMessage(res , 303 , "Login First" , {"Location": '/login' ,...cookieHandler.removeCookie()} , {redirect: '/login'})
  else if (req.url.startsWith('/'))
    homePage(req, res, handlerOptions)

});


//scoket 
const io = new Server(server , {
  path: '/socket'
})
io.on('connection' , (socket) => {
  console.log('a user connected')
  
  socket.on('sendComment' , (comment) => {
    io.emit('newComment' , comment)
  }) 
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server is now listening on PORT: ${PORT}.`);
  console.log(`Server socket listening on PORT: ${PORT}.`)
})

new HLSServer(server , {
  provider: {
    exists: (req, cb) => {
      const ext = path.extname(req.url)
      if(ext !== '.m3u8' && ext !== '.ts')
        return cb(null , true)
      fs.access(__dirname+'/public'+req.url , fs.constants.F_OK , (err) => {
        if(err) {
          console.error('File not exist' , __dirname , req.url)
        
          return cb(null , false)
        }
        cb(null , true)
      })
    },
    getManifestStream: (req , cb) => {
      const stream = fs.createReadStream(__dirname + '/public' + req.url)
      cb(null , stream)
    },
    getSegmentStream: (req , cb) => {
      const stream = fs.createReadStream(__dirname + '/public' + req.url)
      cb(null , stream)
    }

  }
})



// functions
const replyMessage = (res, status, message, header , content) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...header })
  res.end(JSON.stringify({ message: message , ...content}))
}

