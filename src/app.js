//Requiring packages
const express = require('express')
const fs = require('fs');
const app = express()
// Setting up views and public folder
app.set('views','src/views')
app.set('view engine', 'ejs')

app.use(express.static('public'))

// Home route --> /
app.get('/', (request, response) => {
    response.render('home')
})

//Free books route --> /freebooks
app.get('/freebooks', (request, response) => {
    response.render('freebooks')
})


//All books route --> /books
app.get('/books', (request, response) => {
    response.render('allbooks')
})

//Specific books route --> /book/:name
app.get('/book/:name', (request, response) => {

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

})

//Route to check subscription in the header link of specificbook page

app.post('/specbookheader', (request, response) => {
    var subscription = request.session.user.subscription
    response.send(subscription);
})




app.listen('3000', () => {
    console.log('Listening on 3000!')
})