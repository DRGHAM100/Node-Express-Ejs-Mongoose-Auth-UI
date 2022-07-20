const express = require('express');
const { check, body } = require('express-validator/check');
const AuthController = require('../../app/Http/Controllers/Auth/AuthController');
const User = require('../../app/Models/User');
const routes = express.Router();


routes.get('/login',AuthController.getLoginForm);
routes.get('/register',AuthController.getRegisterForm);

routes.post('/login',
[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
    body('password', 'Password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
]
,AuthController.postLogin);





routes.post('/register',
[
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
]
,AuthController.postRegister);


routes.post('/logout', AuthController.postLogout);

module.exports = routes;