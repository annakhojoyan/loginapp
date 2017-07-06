var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hbs = require('nodemailer-express-handlebars');

var User = require('../models/user');


// var mongoose = require('mongoose'),
//     nev = require('email-verification')(mongoose);

var nodemalier = require('nodemailer');

let transporter = nodemalier.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: 'xojoyana5@gmail.com',
        pass: 'asdfghjkl56'
    },
    tls: {
        rejectUnauthorized: false
    }
});



//email
// nev.configure({

//     transportOptions: {
//         service: 'Gmail',
//         auth: {
//             user: 'myawesomeemail@gmail.com',
//             pass: 'mysupersecretpassword'
//         }
//     },
//     verifyMailOptions: {
//         from: 'Do Not Reply <myawesomeemail_do_not_reply@gmail.com>',
//         subject: 'Please confirm account',
//         html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
//         text: 'Please confirm your account by clicking the following link: ${URL}'
//     }
// }, function(error, options){
// });




//index- show all users
// router.get("/", function(req, res){
//     if(req.query.search){
//       const regex = new RegExp(escapeRegex(req.query.search), 'gl');
//   //Get all users from DB
//   User.find({nmae: regex}, function(err, allUsers){
//     if(err){
//       console.log(err);
//     } else {
//       res.render("users.index", {user:allUsers});
//     }
//   });
// }
// });



//Register
router.get('/register', function(req, res) {
    res.render('register');
});
//UserPage
router.get('/userpage', function(req, res) {
    res.render('userpage', {
        user: null
    });
});
//Login
router.get('/login', function(req, res) {
    //res.clearCookie('test', 'my cookie test');
    res.render('login');

});
//Register
router.get('/index', function(req, res) {
    res.render('index');
});

//mail template
router.get('/invite', function(req, res, next) {
    res.render('invite', {
        title: "as"
    });
});

//search system
router.post('/userpage', function(req, res) {
    var username = req.body.search;
User.getUserByUsername(username, function(err, user) {
    console.log(' >>> Searched user >>>' + username + user);
    if (user) {
        var uname = req.cookies['user_id'];

        res.render('userpage', {
            user: user,
            message: ' Lets chat with ',
            uname: uname
        });
    } else {
        console.log('No user searched');
    }
});


});

//Register User
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var bcrypt = require('bcrypt'),
        saltRounds = 10;

    //Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        // console.log('Erro');
        res.render('register', {
            errors: 'errors'
        });
    } else {

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in your password DB. 
                console.log(salt)
            });
        });
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            var options = {
                viewEngine: {
                    extname: '.handlebars',
                    layoutsDir: './',
                    defaultLayout: 'invite'
                },
                viewPath: './',
                extname: '.handlebars'
            };
            let HelperOptions = {
                from: 'xojoyana5@gmail.com',
                to: email,
                subject: "Verify mail",
                template: "invite",
                context: {
                    username: newUser.username
                }
                //text: 'Hello ' + name
            };
            transporter.use('compile', hbs(options));
            transporter.sendMail(HelperOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("the message was sent");
                console.log(info);
            }, function(error, response) {
                console.log('mail sent ');
            });

        });
        req.flash('success_msg', 'You are registered and can now login');
        res.cookie('user_id', newUser.username);
        res.redirect('/users/userpage');
    }

});



passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknow User' })
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            })
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }));



router.get('/logout', function(req, res) {
    req.logout();
    res.clearCookie('user_id');
    req.flash('success_msg', 'You  are logged out');

    res.redirect('/users/login');
});

router.get('/', function(req, res) {
    console.log(user_id);
});


// function escapeRegex(text) = {
//   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };

module.exports = router;
