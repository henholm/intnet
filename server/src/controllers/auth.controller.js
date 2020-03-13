/* jslint node: true */

'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

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
router.post('/assistantAdmin', (req, res) => {
  model.getAssistantTimeSlots(req.body.assistantId).then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
  }).catch((err) => {
    console.log('Error in router.get assistant time slots');
    console.log(err);
  });
});

router.post('/studentAdmin', (req, res) => {
  model.getStudentTimeSlots(req.body.studentName).then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
  }).catch((err) => {
    console.log('Error in router.get student time slots');
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
    // TODO: CHANGE TO USER INSTEAD OF USERID. Include isAssistant and ID.
    // SAME FOR TIME SLOTS.
    const { userData } = response;
    const { msg } = response;
    if (userData) {
      const { userId } = userData;
      const { username } = userData;
      const { isAssistant } = userData;
      const user = { username, userId, isAssistant };

      const token = jwt.sign({
        username,
        userId,
        isAssistant,
      },
      'SECRETKEY', {
        expiresIn: '30m',
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
  // console.log(req.session.cookie);
  // console.log(req.session.cookie.expires);
  // Set the cookie to expire.
  req.session.cookie.expires = new Date(Date.now());
  // Remove the sessionId on logout.
  res.clearCookie('sessionId');
  model.userLogOut(req.body.userId).then(() => (
    res.status(200).send({
      msg: `User ${req.body.username} logged out successfully`,
    })
  )).catch((err) => {
    console.log('Error in router.post(/logout)');
    console.log(err);
  });
});

router.post('/setLoggedIn', (req, res) => {
  console.log();
  console.log('req.body.userId');
  console.log(req.body);
  console.log(req.body.userId);
  model.setLoggedInIfNot(req.body.userId).then((response) => {
    console.log(response);
    return res.status(200).send({
      msg: 'LoggedIn attribute successfully set',
    });
    // return res.status(401).send({
    //   msg,
    // });
  });
});

module.exports = { router };
