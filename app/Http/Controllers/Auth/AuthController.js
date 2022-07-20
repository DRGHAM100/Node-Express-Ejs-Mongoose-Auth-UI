const User = require('../../../Models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

exports.getLoginForm = (req,res,next) => {
    if(req.session.isLoggedIn)
      return res.redirect('/');

    let message = req.flash('error');
    
    if (message.length > 0) 
        message = message[0];
    else 
        message = null;
    
    res.render('Auth/login.ejs',{
        pageTitle: 'Login Page',
        errorMessage: message,
        oldInput: {
          email: '',
          password: ''
        },
        validationErrors: []
      });
}

exports.getRegisterForm = (req,res,next) => {
    if(req.session.isLoggedIn)
      return res.redirect('/');

    let message = req.flash('error');
    
    if (message.length > 0) 
        message = message[0];
    else 
        message = null;
    
    res.render('Auth/register.ejs',{
      pageTitle: 'Register Page',
      errorMessage: message,
      oldInput: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: []
    });
}


exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: errors.array()
      });
    }


    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            return res.status(422).render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMessage: 'Invalid email or password.',
              oldInput: {
                email: email,
                password: password
              },
              validationErrors: []
            });
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
}

exports.postRegister = (req,res,next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/register', {
        path: '/register',
        pageTitle: 'Register Page',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          name: name,
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
      });
    }

    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        isAdmin: 0
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
       
}


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};