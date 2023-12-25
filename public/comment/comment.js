
const isEmpty = (str) => {
    return (!str || str.trim().length === 0)
}

const baseURL = 'http://localhost:3000' //for socket.io
// let storedComments = getCachedData('storedComments') || []
let pagenumber = 0
let lstpagenumber = -1
let pagesize = 5
let newcommentCnt = 0
let username = ''

$(document).ready(() => {
    //navi
    $("#toProfile").on("click", () => {
        window.location.href = '/profile'
    })
    $("#toHome").on('click', () => {
        window.location.href = '/'
    })
    $("#toComment").on("click", () => {
        window.location.href = '/comment'
    })
    //modal
    const modal = $(".modal")
    const modalMessage = $("#modal-message")
    const closeButton = $(".close")

    closeButton.on('click', () => {
        modal.css({
            'display': 'none'
        })
    }),
        window.onclick = (e) => {
            if (e.target === modal) {
                modal.css({
                    'display': 'none'
                })
            }
        }
    const displayModal = (msg) => {
        modal.css({
            'display': 'block',
        })
        modalMessage.html(msg)
    }
    //loader
    const loader = $('.loader')
    const enterText = $('#enterbutton p')
    const displayLoader = () => {
        loader.css({
            'display': 'inline-block'
        })
        enterText.css({
            'display': 'none'
        })
    }
    const closeLoader = () => {
        loader.css({
            'display': 'none'
        })
        enterText.css({
            'display': 'block'
        })
    }

    if (isEmpty(username)) {
        $.ajax({
            url: '/api/curuser',
            method: 'GET',
            success: (res) => {
                if(res.message === 'Cookie Error, delete it') {
                    window.location.href = res.redirect
                } else if (res.message === 'Login First') {
                    window.location.replace(res.redirect)
                } else {
                    username = res.username;

                    fetchMessage(username)
                }
            },
            error: (res) => {
                console.error(res)
                displayModal("Cannot know current user")
            }
        })
    }

    //fetch or update the comments
    const fetchMessage = (username) => {
        const apiurl = '/api/comment' + `?pagenumber=${pagenumber}&pagesize=${pagesize}`

        $.ajax({
            url: apiurl,
            method: 'GET',
            success: (res) => {
                if (res.redirect) {
                    window.location.replace(res.redirect)
                } else {
                    if(res.comments.length === pagesize){
                        pagenumber += 1
                    }
                    lstpagenumber += 1
                    updateCommentBoard(res.comments, username)
                }
            },
            error: (res) => {
                displayModal("Cannot fetch Comments qq")
            }
        })
    }

    const updateCommentBoard = (comments, username) => {
        const commentBoard = $("#commentboard")
        if (comments) {
            comments.forEach(comment => {
                if (comment.username !== username) {
                    commentBoard.prepend(`<div class='user remote'>
                                            <div class='username'><b>${comment.username}</b>:</div>
                                            <div class='content'>${comment.content}</div>
                                         </div>`)
                } else {
                    commentBoard.prepend(`<div class='user local'>
                                            <div class='username'><b>You</b></div>
                                            <div class='content'>${comment.content}</div>
                                         </div>`)
                }
            })
            
            commentBoard.scrollTop(commentBoard[0].scrollHeight);
        }
    }
    const renderCommentBoard = (comment , username) => {
        const commentBoard = $("#commentboard")
        if (comment.username !== username) {
            commentBoard.append(`<div class='user remote'>
                                    <div class='username'><b>${comment.username}</b>:</div>
                                    <div class='content'>${comment.content}</div>
                                 </div>`)
        } else {
            commentBoard.append(`<div class='user local'>
                                    <div class='username'><b>You</b></div>
                                    <div class='content'>${comment.content}</div>
                                 </div>`)
        }
    }

    const socket = io(baseURL, {
        path: '/socket'
    });
    $("#enterbutton").on('click', async () => {
        const inputBar = $("#enter")
        const inputValue = inputBar[0].value
        if (isEmpty(inputValue)) {
            displayModal("Please Enter Comment")
        } else if (inputValue.length >= 51) {
            displayModal("Comment too long. Pls lower than 50 characters")
        } else {
            displayLoader()
            const url = '/api/comment'
            const data = {
                comment: inputValue,
            }
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                headers:{
                    'Content-Type': 'application/json'
                },
                success: (res) => {
                    if(res.message === 'Cookie Error, delete it') {
                        window.location.href = res.redirect
                    } else if (res.message === 'Login First') {
                        window.location.replace(res.redirect)
                    } else {
                        if(res.message === 'Successfully Commented'){
                            inputBar[0].value = ''
                            //maybe a socket.io
                            closeLoader()
                            socket.emit('sendComment', {content: inputValue , username: username});
                            // renderCommentBoard({content: inputValue , username: username} , username)
                        } else {
                            displayModal("Fail to Comment, try again later")
                        }
                    }
                },
                error: (res) => {
                    displayModal("Something unknow happened, try again later")
                }
            })
            closeLoader()
        }
    })
    
    $("#seemore").on('click' , () => {
        if(pagenumber !== lstpagenumber)
            fetchMessage(username)
        else
            displayModal('This is the End')
    })

    socket.on('newComment' , (comment) => {
        newcommentCnt += 1
        if (newcommentCnt === pagesize) 
            pagenumber += 1
        console.log(comment)
        renderCommentBoard(comment , username)
    })

    const videoOption = $('.video-option')
    videoOption.on('click' , (e) => {
        const wantvideo = e.currentTarget.id
        const url = `/stream?wantvideo=${wantvideo}`
        try {
            window.location.href = url
        } catch (e) {
            displayModal("Something Unknown Happened")
        }

    })

})



// const cacheData = (dataName , data , expireMinutes) => {
//     const timestamp = new Date().getTime()
//     const expireTime = expireMinutes * 60 * 1000
//     const expireDate = timestamp + expireTime

//     const cachedData = {
//         data: data,
//         expireDate: expireDate,
//     }
//     localStorage.setItem(dataName, JSON.stringify(cachedData));
// }

// const getCachedData = (dataName) => {
//     const cachedDataString = localStorage.getItem(dataName);
  
//     if (cachedDataString) {
//       const cachedData = JSON.parse(cachedDataString);
//       const currentTimestamp = new Date().getTime();
  
//       if (currentTimestamp < cachedData.expirationDate) {
//         // 数据未过期，返回缓存的数据
//         return cachedData.data;
//       } else {
//         // 数据过期，清除缓存并返回 null
//         localStorage.removeItem(dataName);
//         return null;
//       }
//     }
  
//     return null;
// }