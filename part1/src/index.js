//requiring libraries used.
const express = require("express")
const path = require("path")
const app = express()
const hbs = require("hbs")
//set port if hosting on localhost
port = 3000
//Path to the template folder
const templatePath = path.join(__dirname,'../templates') 
//Calling the mongodb.js
const LogInCollection = require("./mongodb")
//sessions-express
const expressSession = require('express-session');
//Declaring the /public folder
const publicPath = path.join(__dirname, '../public')

//Using express.json and setting proper engines.
app.use(express.json())
app.set("view engine","hbs")
app.set("views",templatePath)
app.use(express.urlencoded({extended:false}))
app.use(express.static(publicPath))



//Generating random secret keys as user IDs
app.use(expressSession({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

//CHECKING IF USER IS LOGGED IN THROUGH THE USER SESSION TOKEN ID.
function requireLogin(req, res, next) {
    if (req.session.isAuthenticated) {
      console.log(`User's random token: ${req.session.randomToken}`);  
      next();
    } else {
      res.redirect("/login");
    }
  }
  

//To avoid the 'X-Content-Type-Options MIME TYPES' error we need to whitelist .css and .js files. 
  app.use('/src', express.static(path.join(__dirname, '../src'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.type('text/css');
        } else if (path.endsWith('.js')) {
            res.type('application/javascript'); // Set the content type for JavaScript files
        }
    }
}));

/*

GET CATEGORY

*/

//root directory
app.get('/', (req, res) => {
    try {
        res.render('main');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

//budget planner directory
  app.get('/budget-planner', requireLogin, (req, res) => {
    try {
      res.render('budget-planner');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error.");
    }
  });

//settings directory
app.get('/settings', requireLogin, (req, res) => {
    try {
        // Assuming the username is stored in the session
        const username = req.session.username; // Replace with the actual session key for the username

        // Render the 'settings' template and pass the 'username' variable
        res.render('settings', { username });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});


  //home directory
app.get('/home', requireLogin, (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

//sign up directory
app.get('/signup', (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

//login directory
app.get('/login', (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

//Logout
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/login'); // Redirect to the login page after logout
        }
    });
});




/*

POST CATEGORY

*/

//Post sign up cateogry
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    }

    await LogInCollection.insertMany([data])
    res.render("home")
});

//Post budger planner directory
app.post("/budget-planner",async(req,res) => {

})

//post settiongs category
app.post("/settings",async(req,res) => {

})

//Post login directory
app.post("/login", async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });
        if (check.password === req.body.password) {
            req.session.isAuthenticated = true;
            req.session.username = check.name; // Store the username in the session
            req.session.randomToken = Math.random().toString(36).substring(2);
            res.render("home");
        } else {
            res.send("Wrong Password!");
        }
    } catch {
        res.send("Wrong credentials, user.");
    }
});

  

//post home directory
app.post("/home", async (req, res) => {
    
  });


//Listening on the specified port on localhost.
app.listen(port, ()=>{
    console.log('connected to',port)
})
