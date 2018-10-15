const express = require('express')
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

//Route Home & Login
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    var user = req.session.user
    res.render('login', { loginFailed: false })
})

app.post('/login', (req, res) => {
    var email = req.body.email
    var password = req.body.password

    //input validation
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
        bcrypt.compare(password, user.password)
            .then((result) => {
                if (result) {
                    req.session.user = user;
                    if (user.subscription == true) {
                        res.redirect('/allbooks')
                    } else {
                        res.redirect('/freebooks')
                    }
                } else {
                    res.redirect('/login', { loginFailed: true });
                }
            });

    }).catch((err) => {
        console.log(err, err.stack)
        // res.render('home', { loginFailed: true })
    })
})

//Route - Register
app.get('/register', (req, res) => {
    res.render('register', { registerFailed: false });
})

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
                req.session.user = user;
                res.redirect('/freebooks')

            })
                .catch((err) => {
                    console.error(err)
                    // res.render('register', { registerFailed: true })
                })
        })
    }
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