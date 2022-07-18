const User = require('../../../Models/User');
const bcrypt = require('bcryptjs');

exports.getLoginForm = (req,res,next) => {
    if(req.session.isLoggedIn)
      return res.redirect('/');

    let message = req.flash('error');
    
    if (message.length > 0) 
        message = message[0];
    else 
        message = null;
    
    res.render('Auth/login.ejs',{pageTitle: 'Login Page',errorMessage: message});
}

exports.getRegisterForm = (req,res,next) => {
    if(req.session.isLoggedIn)
      return res.redirect('/');

    let message = req.flash('error');
    
    if (message.length > 0) 
        message = message[0];
    else 
        message = null;
    
    res.render('Auth/register.ejs',{pageTitle: 'Register Page',errorMessage: message});
}


exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Invalid email or password.');
          return res.redirect('/login');
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
            res.redirect('/login');
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

    User.findOne({email: email})
    .then(user =>{

        if(user){
            req.flash('error', 'Email already used by another user !');
            return res.redirect('/register');
        }

        return bcrypt.hash(password,12)
        .then(hashedPassword => {
            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                isAdmin: 0
            });

            newUser.save();
       
            res.redirect('/login');
        });
       
        


    })
    .catch(err =>{
        console.log(err);
    })
}


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};