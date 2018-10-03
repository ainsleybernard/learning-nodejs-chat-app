var express = require('express')

//express has no built-in support to parse the body, so we will package called body-parser
var bodyParser = require('body-parser')
var app = express()

//setting up socket.io is a bit tricker than most other packages, that because it needs to tie in with Express, so will create a regular http server with node
//that will then share with express and sockey.io
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(__dirname))
//this lets body parser know that we expect JSON to be coming in with our HTTP request.
app.use(bodyParser.json())
//add this because what comes in from the browser is URL encoded, so we must setup body parser to support this.
app.use(bodyParser.urlencoded({ extended: false }))

var messages = [{ name: 'bob', message: 'hi' }, { name: 'sam', message: 'hi' }]

app.get('/messages', (req, res) => {
    res.send(messages)
})

app.post('/messages', (req, res) => {
    messages.push(req.body)
    io.emit('message',req.body)
    res.sendStatus(200)
})

io.on('connection', (socket) => {
    console.log('user connected')
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});