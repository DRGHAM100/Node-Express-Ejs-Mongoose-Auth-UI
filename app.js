require('dotenv').config();
const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
const port = process.env.PORT;
const bodyParser = require('body-parser');
const User = require('./app/Models/User');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const authRoutes = require('./routes/Auth/index');
const isAuth = require('./app/Http/Middleware/is_auth');
const app = express();

const store = new MongoDBStore({
    uri: process.env.DB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine','ejs');
app.set('views','resources/views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
    })
);

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.APPNAME = process.env.APPNAME;
    next();
});

app.get('/',(req,res,next)=>{
    res.render('welcome.ejs',{pageTitle: 'Welcome Page'});
});


app.use(authRoutes);

mongoose.connect(process.env.DB_URI)
.then(()=>{
    console.log('Connect To DB..');
    app.listen(port);
})
.catch(err => {
    console.log(err);
});




