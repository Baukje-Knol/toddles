const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({
  extended: true
}))
const sequelize = new Sequelize({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.TODDLES,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  dialect: 'postgres',
  storage: './session.postgres',
});

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
  },
  cvv: {
    type: Sequelize.INTEGER,
  },
  cardnumber: {
    type: Sequelize.BIGINT,
  },
  expiration: {
    type: Sequelize.STRING,
  }
})

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (request, response) => {
  response.render('home')
})

//subscription
app.get('/subscription', (request, response) => {
  response.render('subscription')
})
app.post('/subscription', (request, response) => {
  // user = request.session.user.id
  id = 1
  User.update({
      subscription: true,
      owner: request.body.owner,
      cvv: request.body.cvv,
      cardnumber: request.body.cardnumber,
      expiration: request.body.expiration,
    }, {
      returning: true,
      where: {
        id:id
      }
    })
    .then(user => {
      response.redirect('/books')
    })
})

//routing
app.get('/routing', (request, response) => {
  // user=request.session.user
  user = 1
  User.findOne({
      where: {
        id: user
      }
    })
    .then(user => {
      if (user.subscription == true) {
        response.redirect('/books')
      } else(response.redirect('/freebooks'))
    })
})

//Settings
app.get('/settings', (request, response) => {
  // user=request.session.user
  user = 1;
  User.findOne({
      where: {
        id: user
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
app.post('/settings', (req, res) => {
  // $('.button').on('click', (event) => {
    // let user = req.session.user.id;
    let id =1
    let subscription=false
    if (subscription == true) {
      console.log("--------------" +id)
      User.update({
          subscription: false
        }, {
          where: {
            id: id
          }
        })
        .then(() => {
          res.redirect('/settings')
        })
    } else{res.redirect('/subscription')}
  // })
})

sequelize.sync({
  force: false
})
app.listen('3000', () => {
  console.log('Listening on 3000!')
})
