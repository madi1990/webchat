const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const redis = require('redis')

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

// redisClient will act as subscriber
const redisClient = redis.createClient({
    url: "redis://localhost:6379",
    password: "1qaz2wsx#EDC"
})

const publisher = redisClient.duplicate()

redisClient.subscribe(defaultRoom)

redisClient.on('connect', function() {
    console.log('redis connected');
});

redisClient.on('message', (channel, msg) => {
    // Sub
    if (channel === defaultRoom) {
        // Send message to users
        io.to(defaultRoom).emit("message", generatemsg(io.id, msg))
    }
});

io.on('connection', (socket) => {
    console.log("new connection")

    // User joins
    socket.on("join", ({ username, room }) => {
        socket.join(room)
        socket.emit("message", generatemsg("Admin", "Welcome!"))
        //socket.broadcast.to(room).emit("message", generatemsg("Admin", username + ` has joined!`))
        publisher.publish(room, username + ` has joined!`)
    })

    // Receive message from users
    socket.on("sendMessage", (msg, callback) => {
        // Pub
        publisher.publish(defaultRoom, msg)
        if(callback) callback()
    })
})

server.listen(PORT, () => {
    console.log("server is up running on " + PORT)
})