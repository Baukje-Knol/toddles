const express = require('express')
const app = express()

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get ('/', (request, response)=>{
    response.render('home')
})


app.listen('3000',()=>{console.log('Listening on 3000!')})

