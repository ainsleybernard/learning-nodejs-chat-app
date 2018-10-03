var express = require('express')

//express has no built-in support to parse the body, so we will package called body-parser
var bodyParser = require('body-parser')
var app = express()

//setting up socket.io is a bit tricker than most other packages, that because it needs to tie in with Express, so will create a regular http server with node
//that will then share with express and sockey.io
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
var settings = require('./app_settings.js')
var dbUrl = settings.dbUrl



var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.use(express.static(__dirname))
//this lets body parser know that we expect JSON to be coming in with our HTTP request.
app.use(bodyParser.json())
//add this because what comes in from the browser is URL encoded, so we must setup body parser to support this.
app.use(bodyParser.urlencoded({ extended: false }))




app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=>{
        res.send(messages)

    })
})

app.post('/messages', (req, res) => {

    var message = new Message(req.body)
    message.save((err => {
        
        if (err)     
            sendStatus(500)


        io.emit('message', req.body)
        res.sendStatus(200)
       

        
    }))


})

io.on('connection', (socket) => {
    console.log('user connected')
})

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err)
})


var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});