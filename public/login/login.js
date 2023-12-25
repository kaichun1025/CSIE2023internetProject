const isEmpty = (str) => {
    return (!str || str.trim().length === 0);
}

$(document).ready(() => {
    //login page
    const loginbutton = $('#loginbutton')
    const regibuttonL = $('#regibutton-l')

    //regi page
    const regibutton = $('#regibutton')
    const cancelbutton = $('#cancelbutton')
    // console.log(loginbutton)
    // console.log(regibutton)
    // console.log(regibutton.length === 0)
    const mainbutton = (regibutton.length === 0) ? loginbutton : regibutton
    //console.log(mainbutton)
    mainbutton.on('click', async () => {
        const userbar = $('#user')
        const pswbar = $('#psw')
        const pswcbar = $('#pswc')

        const username = userbar[0].value
        const psw = pswbar[0].value
        const pswc = (pswcbar.length !== 0) ? pswcbar[0].value : ''
        if (isEmpty(username) || isEmpty(psw) || (pswcbar.length !== 0 && isEmpty(pswc))) {
            displayModal('Please enter Username and Password!')
        } else if (!/^[a-zA-Z0-9]*$/.test(psw) || !/^[a-zA-Z0-9]*$/.test(username)) {
            displayModal('Username & Password ONLY contain letters and Numbers!')
            pswbar[0].value = '', pswcbar[0].value = ''
        } else if (pswcbar.length !== 0 && psw !== pswc) {
            displayModal('Passwords are not the same!')
            pswbar[0].value = '' , pswcbar[0].value = ''
        } else {
            const data = {
                username: username,
                password: psw,
            }

            const url = (pswcbar.length !== 0) ? '/regi' : '/login'
            const delayTime = 2000
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
                    } else if (res.message === 'Successfully Signed Up') { //regi
                        displayModal('Successfully Signed Up')
                        setTimeout(() => {
                            window.location.replace(res.redirect)
                        }, delayTime)
                    } else if (res.message === 'nameTaken') {
                        displayModal('UserName has been used, change another one')
                        userbar[0].value = '', pswbar[0].value = '', pswcbar[0].value = ''
                    } else if (res.message === 'Fail to Create') {
                        displayModal('Something unknown happened, try again later')
                    } else if (res.message === 'NoUser') { // login
                        displayModal('User not exist')
                        userbar[0].value = '', pswbar[0].value = ''
                    } else if (res.message === 'Successfully Login') {
                        displayModal('Successfully Logged In')
                        console.log(res.redirect)
                        setTimeout(() => {
                            window.location.replace(res.redirect)
                        }, delayTime)
                    } else if (res.message === 'pswWrong') {
                        displayModal('Password is wrong, try again')
                        pswbar[0].value = ''
                    }
                },
                error: (res) => {
                    window.alert("Something Unknown Happened")
                }
            })
        }
        
    })
    
    //cancelbutton
    if (mainbutton === regibutton) {
        cancelbutton.on('click', () => {
            window.location.href = '/login'
        })
    }
    //regibuttonL
    console.log(mainbutton === loginbutton)
    if(mainbutton === loginbutton) {
        regibuttonL.on('click' , () => {
            window.location.href = '/regi'
        })
    }
    
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
})