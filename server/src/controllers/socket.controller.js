/* jslint node: true */

'use strict';

const express = require('express');
const model = require('../model.js');
const jwt = require('jsonwebtoken');
const router = express.Router();

const userMiddleware = require('../middleware/users.js');

/**
 * Authenticate input assistant name and password.
 * @returns {void}
 */
router.get('/assistantLogin/:name/:pword', (req, res) => {
  model.authenticateAssistant(req.params.name, req.params.pword).then((resolve) => {
    res.status(200).json({
      isAuthenticated: resolve,
    });
  }).catch((err) => {
    console.log('Error in router.get assistant login');
    console.log(err);
  });
});

/**
 * Get time slots belonging to the assistant corresponding to the input id.
 * @returns {void}
 */
router.get('/assistantLogin/:assistantName', (req, res) => {
  model.getAssistantTimeSlots(req.params.assistantName).then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
  }).catch((err) => {
    console.log('Error in router.get assistant time slots');
    console.log(err);
  });
});

/**
 * Fetch the list of existing time slots.
 * @returns {void}
 */
router.get('/timeSlots', (req, res) => {
  model.getTimeSlots().then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
  });
});

/**
 * Fetch the data corresponding to the input timeslot id and alter the state of
 * the timeslot. Transmit the change of state to other over the websocket.
 * @returns {void}
 */
router.get('/timeSlotData/:timeSlotId', (req, res) => {
  model.getTimeSlotById(req.params.timeSlotId).then((resolve) => {
    res.status(200).json({
      timeSlotData: resolve,
    });
  });
  // model.setTimeSlotBookedBy(req.params.timeSlotId, "reserved");
});

router.post('/login', (req, res, next) => {
  model.loginUser(req.body.username, req.body.password).then((userId) => {
    if (userId) {
      const token = jwt.sign({
        username: req.body.username,
        userId: userId
      },
      'SECRETKEY', {
        expiresIn: '10m'
      });

      // Optionally use database model to set last login of user.

      return res.status(200).send({
        msg: 'Logged in',
        token,
        username: req.body.username,
        userId: userId
      });
    }
    return res.status(401).send({
      msg: '/login Username or password incorrect'
    });
  });
});

router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = { router };
