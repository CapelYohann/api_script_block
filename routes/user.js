const express = require('express');
const bodyParser = require('body-parser');
const controllers = require('../controllers');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt.utils');

const UserController = controllers.UserController;

const userRouter = express.Router();
userRouter.use(bodyParser.json());


userRouter.post('/login', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  
  if(email === null || password === null) {
    res.status(400).json({ 'error': 'parametres invalides' });
  }
  
  UserController.checkUser(email)
  .then((user) => {
    if(user) {
      bcrypt.compare(password, user.password, function(err, result) {
        if(result) {
          res.status(200).json({
            'id': user.id,
            'isAdmin': user.admin,
            'token': jwt.generateToken(user)
          });
        } else {
          res.status(403).json({ 'error': 'invalid password' });
        }
      });
    } else {
      res.status(404).json({ 'error': 'user not in DB' });
    }
  })
  .catch((err) => {
    res.status(500).json({ 'error': 'unable to find user' });
  });
});

userRouter.post('/register', function(req, res) {
  const email = req.body.email;
  const password1 = req.body.password1;
  const password2 = req.body.password2;
  const name = req.body.name;
  
  if(email === undefined || password1 === undefined || password2 === undefined || name === undefined) {
    res.status(400).json({ 'error': 'parametres invalides' });
  }
  
  if(password1 !== password2) {
    res.status(500).json({ 'error': 'passwords are different' });
  } else {
    UserController.checkUser(email)
    .then((user) => {
      if(!user) {
        bcrypt.hash(password1, 5, function(err, bcryptpwd) {
          UserController.createUser(email, bcryptpwd, name)
          .then((newUser) => {
            res.status(201).json({ 'id': newUser.id });
          })
          .catch((err) => {
            res.status(500).json({ 'error': 'user creation failed' });
          });
        });
      } else {
        res.status(409).json({ 'error': 'User already exists' });
      }
    });
  }
});

module.exports = userRouter;
