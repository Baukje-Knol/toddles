//Requiring packages
const express = require('express')
const fs = require('fs');
const app = express()
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt')

const sequelize = new Sequelize(process.env.TODDLES, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT,
    default: {
        timestamp: false
    },
    storage: './session.postgres'
})

app.set('views', './src/views')
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    store: new SequelizeStore({
        db: sequelize,//values are passed from const sequelize
        checkExpirationInterval: 15 * 60 * 1000,
        expiration: 24 * 60 * 60 * 1000
    }),
    secret: "safe",
    saveUnitialized: true,
    resave: false
}))

//Define the User with Sequelize
const User = sequelize.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    subscription: {
        type: Sequelize.BOOLEAN,
    },
    owner: {
        type: Sequelize.STRING,
        unique: true
    },
    cvv: {
        type: Sequelize.INTEGER,
        unique: true
    },
    cardnumber: {
        type: Sequelize.INTEGER,
        unique: true
    },
    expiration: {
        type: Sequelize.STRING
    }
}, {
        timestamp: false

    })


// Home route --> /
app.get('/', (request, response) => {
    response.render('home')
})
//Login route --> /login
app.get('/login', (req, res) => {
    var user = req.session.user
    res.render('login', { loginFailed: false })
})

app.post('/login', (req, res) => {
    var email = req.body.email
    var password = req.body.password

    // input validation
    if (password == null || password.length < 8 ||
        email == null || email.length == 0) {
        res.render('login', { loginFailed: true })
        return;
    }

    //user authentication
    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if (user == null) {
            res.render('login', { loginFailed: true })
        } else {
        bcrypt.compare(password, user.password)
            .then((result) => {
                if (result) {
                    req.session.user = user;
                    if (user.subscription == true) {
                        res.redirect('/books')
                    } else {
                        res.redirect('/freebooks')
                    }
                } else {
                    res.redirect('/login', { loginFailed: true });
                }
            });
        }

    }).catch((err) => {
        console.log(err, err.stack)
        res.render('home', { loginFailed: true })
    })
})

//Route - Register
app.get('/register', (req, res) => {
    res.render('register', { registerFailed: false });
})

// email validation
app.post('/validation', (req, res) => {
    var email = req.body.email
    User.findOne({
        where: {
            email: email
        }
    })
        .then(user => {
            if (user === null) {
                res.send(true)
            } else {
                res.send(false)
            }
        }).catch((err) => {
            console.log(err, err.stack)
            res.render('register', { registerFailed: true })
        })
})

//Route -/register
app.post('/register', (req, res) => {
    var inputname = req.body.name
    var inputemail = req.body.email
    var inputpassword = req.body.password
    var confirmpassword = req.body.confirmpassword
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    var saltRounds = 10

    if (
        inputpassword == null ||
        inputpassword.length < 8 ||
        inputpassword !== confirmpassword ||
        inputemail == null ||
        regex.test(inputemail) == false
    ) {
        res.render('register', { registerFailed: true })
    } else {

        bcrypt.hash(inputpassword, saltRounds).then(hash => {
            User.create({

                name: inputname,
                email: inputemail,
                subscription: false,
                password: hash
            }).then((user) => {
                console.log(user)
                console.log(req.session)
                var id = user.id;
                req.session.user = {};
                var subscription = user.subscription;
                req.session.user.id = id
                req.session.user.subscription = subscription
                res.redirect('/freebooks')


            })
                .catch((err) => {
                    console.error(err)
                    res.render('register', { registerFailed: true })
                })
        })
    }
})
//Free books route --> /freebooks
app.get('/freebooks', (request, response) => {
    let user = request.session.user
    if (user == null || user == undefined) {
        response.redirect('/');
    } else {
        response.render('freebooks');
    }
})


//All books route --> /books
app.get('/books', (request, response) => {
  let user = request.session.user
  if (user == null || user == undefined) {
    response.redirect('/')}
     else { if (user.subscription === false) {
        response.redirect('/');
    } else {
        response.render('allbooks');
    }}
})

//Specific books route --> /book/:name
app.get('/book/:name', (request, response) => {
    console.log(request.session.user)
    let user = request.session.user
    if (user == null) {
        response.redirect('/');
    } else {
        var name = request.params.name
        fs.readFile('./book_links.json', function (err, data) {
            if (err) {
                throw err;
            }
            var parsed = JSON.parse(data);
            for (let i = 0; i < parsed.length; i++) {
                if (name.toLowerCase() === parsed[i].title.toLowerCase()) {
                    link = parsed[i].link
                    response.render('specificbook', {
                        link: link
                    })
                }
            }
        })
    }
})

//subscription
app.get('/subscription', (request, response) => {
    response.render('subscription')
})
app.post('/subscription', (request, response) => {
    user = request.session.user
    User.update({
        subscription: true,
        owner: request.body.owner,
        cvv: request.body.cvv,
        cardnumber: request.body.cardnumber,
        expiration: request.body.expiration,
    }, {
            returning: true,
            where: {
                id: user.id
            }
        })
        .then(user => {
          request.session.user.subscription=true
            response.redirect('/books')
        })
})


//routing
app.get('/routing', (request, response) => {
    user = request.session.user

    User.findOne({
        where: {
            id: user.id
        }
    })
        .then(user => {
            if (user.subscription == true) {
                response.redirect('/books')
            } else (response.redirect('/freebooks'))
        })
})

//Settings
app.get('/settings', (request, response) => {
    user = request.session.user

    User.findOne({
        where: {
            id: user.id
        }
    })
        .then(user => {
            let name = user.name
            let subscription = user.subscription
            if (user.subscription == true) {
                let link = "Cancel Subscription";
                response.render('settings', {
                    name: name,
                    subscription: subscription,
                    link: link
                })
            } else {
                let link = "Subscribe now";
                response.render('settings', {
                    subscription: subscription,
                    name: name,
                    link: link
                })
            }
        })
})
app.post('/settings', (request, response) => {

    user = request.session.user
    if (user.subscription == true) {
        User.update({
            subscription: false
        }, {

                where: {
                    id: user.id
                }
            })
            .then(() => {

                request.session.user.subscription = false;
                response.redirect('/settings')
            })
    } else {
        response.redirect('/subscription')
    }


})

//about
app.get('/about', (request, response) => {
    response.render('about')
})


//Route - Log out
app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            throw error;
        }
        res.redirect('/');
    })

})

sequelize.sync()

app.listen('3000', () => {
    console.log('Listening on 3000!')
})
