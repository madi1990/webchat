const socket = io()

const $msgForm = document.querySelector("#user")
const $msgForInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
// const $msgForInput = $msgForm.querySelector('input')
const $geoLocationButton = document.querySelector("#getLocation")
const $messages = document.querySelector("#messages")
const $locations = document.querySelector("#locations")

const msgtemplate = document.querySelector("#msg-template").innerHTML
const loctemplate = document.querySelector("#location-template").innerHTML
const sidebartemplate = document.querySelector('#user-rooms').innerHTML
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const username = socket.id
const room = 'default'

const autoscroll = () => {
    const $newmsg = $messages.lastElementChild
    const newmsgStyles = getComputedStyle($newmsg)

    const newMsgMargin = parseInt(newmsgStyles.marginBottom)
    const newmsgheight = $newmsg.offsetHeight + newMsgMargin



    const visibleHeight = $messages.offsetHeight

    const containerHeght = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeght - newmsgheight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight

    }
}

$msgForm.addEventListener("submit", (e) => {
    e.preventDefault()

    $msgFormButton.setAttribute('disabled', 'disabled')
    let msg = document.querySelector("input").value

    socket.emit("sendMessage", msg, (error) => {
        $msgFormButton.removeAttribute('disabled')
        $msgForInput.value = ''
        $msgForInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

socket.on("message", (msg) => {
    console.log(msg)
    const html = Mustache.render(msgtemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:m A, DD MMM YYYY')
    })

    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.emit('join', { username, room }, (error) => {})