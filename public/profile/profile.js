$(document).ready(() => {
    $("#toProfile").on("click" , () => {
        window.location.href = '/profile'
    }),
    $("#toHome").on('click' , () => {
        window.location.href = '/'
    }),
    $("#toComment").on("click" , () => {
        window.location.href = '/comment'
    })

    $(".button").on("click" , () => {
        $.ajax({
            url: '/logout',
            method: 'GET',
            success: (res) => {
                if(res.message === 'Cookie Error, delete it') {
                    window.location.href = res.redirect
                } else if(res.message === 'Successfully Logged Out') {
                    window.location.replace(res.redirect)
                } else {
                    window.alert("Might not logged out successfuly")
                }
            },
            error: (res) => {
                window.alert('Something wrong happened')
            }
        })
    })
})