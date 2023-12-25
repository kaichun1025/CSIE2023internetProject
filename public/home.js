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
})
