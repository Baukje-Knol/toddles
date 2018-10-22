# Welcome to Toddles! #
  Toddles was created by the Geniue team in order to fulfil the specifications for our group assignment.
  We are students at the BSSA for Full-Stack Web Development.

  The idea behind Toddles is to provide parents and caregivers with a simple subscription-based platform where they may access
  night-time books and stories for reading pleasure for the children (age 0-9).

  This web-app has been designed with child-friendliness and simplicity in mind, as well as for use on desktops, laptops and tablets
  (preferably on landscape mode). Most of the competition uses static webpages which are full of text and not user-friendly. 

![Homepage](/public/images/screenshot1.png)

## Built with: ##
* __Node.js__ - run-time environment
* __JavaScript__ - main programming language used
* __EJS__ - template engine to render the HTMLs
* __CSS__ - styling language
* __PostgreSQL__ - OR database system
* __Bcrypt__ - password hashing
* __AJAX__ - responsive frontend
* __jQuery__ - library used to implement AJAX
* __Sequelize__ - promise-based ORM for Node.js
* __express__ - web framework for Node.js
* __express-sessions__ - session middleware
* __bodyParser__ - parsing the data from frontend to backend
* __fs__ - reading our JSON files
* __anyflip.com__ - flipbook creator
* __freekidsbooks.org__ - book content source


## In order to use: ##
 * set up database in postgres

 * set up environmental variables in .bash_profile:
    ```
    {
    db: process.env.TODDLES,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT
    }
    ```

 * next, install required packages/dependencies:
    ```
    $ npm install
     ```

 * run the application in node:
    ```
    $ node src/app.js or $ nodemon src/app.js
    ```

##### Finally: ENJOY IN YOUR FAVOURITE BROWSER :) #####


## Authors: ##
#### [Morgana](https://www.linkedin.com/in/morgana-f-sá-maia/), [Trinh](https://www.linkedin.com/in/tutrinhnguyenha/), [Baukje](https://www.linkedin.com/in/baukje-knol/) ####

## Views ##
![Register](/public/images/screenshot4.png)

![Books](/public/images/screenshot2.png)

![Subscription](/public/images/screenshot3.png)
