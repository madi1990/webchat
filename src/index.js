const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const PORT = process.env.PORT || 3000
const publicdir = path.join(__dirname, '../public')
app.use(express.static(publicdir))

const { generatemsg } = require('./utils/messages')
const defaultRoom = 'default'

app.get('/test', function (req, res) {
    res.send('hello world')
})

app.get('/chat', function (req, res) {
    res.send('hello world')
})

io.on('connection', (socket) => {
    console.log("new connection")

    socket.on("join", ({ username, room }) => {
        socket.join(room)
        socket.emit("message", generatemsg("Admin", "Welcome!"))
        socket.broadcast.to(room).emit("message", generatemsg("Admin", username + ` has joined!`))
    })

    socket.on("sendMessage", (msg, callback) => {
        io.to(defaultRoom).emit("message", generatemsg(socket.id, msg))
        if(callback) callback()
    })
})

server.listen(PORT, () => {
    console.log("server is up running on " + PORT)
})