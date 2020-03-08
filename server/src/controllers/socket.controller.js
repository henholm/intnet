/* jslint node: true */

'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const model = require('../model.js');
const userMiddleware = require('../middleware/users.js');

const router = express.Router();

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
router.post('/timeSlots', userMiddleware.isLoggedIn, (req, res) => {
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
router.post('/timeSlotData', userMiddleware.isLoggedIn, (req, res) => {
  model.getTimeSlotById(req.body.timeSlotId).then((resolve) => {
    res.status(200).json({
      timeSlotData: resolve,
    });
  // A non-existent time slot was requested.
  }).catch((err) => {
    console.log('Error in router.get timeSlotData');
    console.log(err);
    return res.status(401).send({
      msg: '',
    });
  });
});

router.post('/login', (req, res) => {
  model.loginUser(req.body.username, req.body.password).then((response) => {
    const { userId } = response;
    const { msg } = response;
    if (userId) {
      const user = { username: req.body.username, userId };

      const token = jwt.sign({
        username: user.username,
        userId: user.userId,
      },
      'SECRETKEY', {
        expiresIn: '10m',
      });

      // Optionally use database model to set last login of user.

      return res.status(200).send({
        msg,
        token,
        user,
      });
    }
    return res.status(401).send({
      msg,
    });
  });
});

router.post('/logout', (req, res) => {
  model.userLogOut(req.body.userId).then(() => (
    res.status(200).send({
      msg: `User ${req.body.username} logged out successfully`,
    })
  )).catch((err) => {
    console.log('Error in router.post(/logout)');
    console.log(err);
  });
});

module.exports = { router };
