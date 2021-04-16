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

app.get('/test', function (req, res) {
    res.send('hello world')
})

io.on('connection', (socket) => {
    console.log("new connection")

    const redisClient = redis.createClient({
        url: "redis://localhost:6379",
        password: "1qaz2wsx#EDC"
    })

    redisClient.on('connect', function() {
        console.log('redis connected');
    });

    const publisher = redisClient.duplicate()   

    // Receive a broadcast message
    redisClient.on('message', (room, enc) => {
        console.log(enc);
        var obj = JSON.parse(enc)
        socket.broadcast.to(room).emit("message", generatemsg(obj.username, obj.msg))
    })

    // Receive message from users
    socket.on("sendMessage", (obj, callback) => {
        // Send message to itself
        socket.emit("message", generatemsg(obj.username, obj.msg))
        publisher.publish(obj.room, JSON.stringify(generatemsg(obj.username, obj.msg)))
        if(callback) callback()
    })

    // User joins
    socket.on("join", ({ username, room }) => {
        socket.join(room)
        // Listen to the data broadcast from the same room
        redisClient.subscribe(room)
        // Send admin greeting to the newly joined customer itself
        socket.emit("message", generatemsg("Admin", "Welcome!"))
        // Broadcast user join message to the same room except itself
        publisher.publish(room, JSON.stringify(generatemsg("Admin", username + ` has joined!`)))
    })

})

server.listen(PORT, () => {
    console.log("server is up running on " + PORT)
})