var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var port = process.env.PORT || 3000;

var dbUrl = 'mongodb://xxxx:xxxx@ds053774.mlab.com:53774/todolist'; 

var Task = mongoose.model('Task', {
    task: String,
    status: String
});
//var task = ["anirocks", "sex"];
//var task = [{ "task": "fuck", "status": "no" }, {"task": "suck", "status": "yes"}]
var task =[];

app.get('/tasks', (req,res) => {
    Task.find({}, (err, tasks) => {
        res.send(tasks);
    });
});

app.post('/tasks', (req,res) => {

    if(req.body.status == "clear") {
        Task.remove({status: "yes"}, (err) => {
            if(err) {
                console.log(err);
            }
        });
        io.emit('taskStatus', req.body);
        res.sendStatus(200);
    }

    else if(req.body.status == "yes") {
        var todo = new Task(req.body);
        console.log(todo);
        
        Task.findOneAndUpdate( {task: req.body.task, status: "no"}, {$set:{status:"yes"}}, (err) => {
            if(err) {
                console.log(err);
            }
        });

        io.emit('taskStatus', req.body);
        res.sendStatus(200);
    }
    else {
        var todo = new Task(req.body);
        console.log(todo);
        todo.save((err) => {
            if (err) {
                sendStatus(500);
            }

            io.emit('taskAdd', req.body);
            res.sendStatus(200);
        });
    }

        
});

io.on('connection', (socket) => {
    console.log("Someone joined");
});

mongoose.connect(dbUrl, {useMongoClient: true} , (err) => {
    console.log("mongo connected", err);
});

var server = http.listen(port, () => {
    console.log("Server is listen on port", server.address().port);
});
