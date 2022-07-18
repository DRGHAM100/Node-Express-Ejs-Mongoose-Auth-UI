const express = require('express');
const routes = express.Router();
const AuthController = require('../../app/Http/Controllers/Auth/AuthController');

routes.get('/login',AuthController.getLoginForm);
routes.get('/register',AuthController.getRegisterForm);

routes.post('/login',AuthController.postLogin);
routes.post('/register',AuthController.postRegister);

routes.post('/logout', AuthController.postLogout);

module.exports = routes;