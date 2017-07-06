var express = require('express'),
    app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var hbs = require('express-handlebars');
//cookie
var app = express();
app.use(cookieParser());
// app.get('/localhost/', function(req, resp) {
//    console.log(req.cookies['Username', "user_id"];
// } 

//db database
// db.users.mapReduce(map, reduce,{out:"Username"});
// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/views/userpage.handlebars');
// });
// io.on('connection', function(socket) {
//     console.log('a user connected');
// });


mongoose.connect('mongodb://localhost/chatapp');
// mongo.connect('mongodb://localhost/chatapp', function(err, db) {
//     if (err) throw err;

//     io.on('connection', function(socket) {

//         var col = db.collection('messages');
//         sendStatus = function(s) {
//             socket.emit('status', s);
//         };

//         //Emit all messages
//         col.find().limit(100).sort({ _id: 1 }).toArray(function(err, res) {
//             if (err) throw err;
//             socket.emit('output', res);
//         });

//         //wait for input
//         socket.on('input', function(data) {
//             var name = data.name,
//                 message = data.message,
//                 whitespacePattern = /^\s*$/;


//             if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
//                 sendStatus('Name and message is required.');
//             } else {
//                 col.insert({ name: name, message: message }, function() {

//                     //Emit latest message to all clients

//                     io.emit('output', [data]);



//                     sendStatus('Message Sended');
//                     sendStatus({
//                         message: 'Message sent',
//                         clear: true
//                     });
//                 });
//             }
//         });
//     });
// });



var db = mongoose.connection;


var routes = require('./routes/index');
var users = require('./routes/users');

//init app
// var app = express();


//vew  Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'invite', layoutsDir: __dirname + '/invite' }));
app.set('invite engine', 'hbs');

// app.set('invite', path.join(__dirname, 'invite'));
// app.engine('handlebars', exphbs({ defaultLayout: 'invite' }));
// app.set('invite engine', 'handlebars');

//bodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport initialize
app.use(passport.initialize());
app.use(passport.session());

//express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Connect Flash
app.use(flash());

//Global Vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});



app.use('/', routes);
app.use('/users', users);

//set port
app.set('port', (process.env.PORT || 3000));

var io = require('socket.io').listen(app.listen('3000'));

io.sockets.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
});
