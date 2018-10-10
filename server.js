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

//indicate to mongoose which promise library we want to use, in this case the ES6 Promise library
mongoose.Promise = Promise


app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)

    })
})

//user parameter
app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    //if the name matches the user.
    Message.find({name:user}, (err, messages) => {
        res.send(messages)

    })
})

// Example of nested callback hell
// app.post('/messages', (req, res) => {

//     var message = new Message(req.body)
//     message.save((err => {

//         if (err)
//             sendStatus(500)

//         Message.findOne({ message: 'badword' }, (err, censored) => {
//             if (censored) {
//                 console.log('censored words found', censored)
//                 Message.remove({ _id: censored.id }, (err) => {
//                     console.log('removed censored message')
//                 })
//             }
//         })

//         io.emit('message', req.body)
//         res.sendStatus(200)
//     }))
// })


//example using promises, another way to work with async code.
//promises return an object which promise to do some work
// this object has separate callbacks for success and for failures.
// app.post('/messages', (req, res) => {

//     var message = new Message(req.body)

//     message.save()
//         .then(() => {
//             console.log('saved')
//             return Message.findOne({ message: 'badword' })
//         })
//         .then(censored => {
//             if (censored) {
//                 console.log('censored words found', censored)
//                 return Message.deleteOne({ _id: censored.id })
//             }
//             io.emit('message', req.body)
//             res.sendStatus(200)

//         })

//         .catch((err) => {
//             res.sendStatus(500)
//             return console.error(err)
//         })
// })

//async example
//Makes asynchronous code look more synchronous
//ti wirk with await, wee wil need to declare our express function as async
 app.post('/messages', async (req, res) => {


    try {

        var message = new Message(req.body)

        var savedMessage = await message.save()
        console.log('saved')
        var censored = await Message.findOne({ message: 'badword' })


        if (censored) {
            await Message.deleteOne({ _id: censored.id })
            console.log('removed censored message')
        }
        else {
            io.emit('message', req.body)

        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }

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