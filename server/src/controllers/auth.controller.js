/* jslint node: true */

'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const model = require('../model.js');
const userMiddleware = require('../middleware/users.js');

const router = express.Router();

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
    console.log(err);
    return res.status(401).send({
      msg: '',
    });
  });
});

router.post('/login', (req, res) => {
  const cookie = req.cookies.sessionId;
  const sid = cookieParser.signedCookie(cookie, 'SECRETKEY');
  const { ip } = req;
  // console.log(`sid ${sid} ip ${ip}`);
  model.loginUser(req.body.username, req.body.password, sid, ip).then((response) => {
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
    console.log(err);
  });
});

router.post('/checkValidSession', (req, res) => {
  const { username } = req.body;
  const { ip } = req;
  const cookie = req.cookies.sessionId;
  const sid = cookieParser.signedCookie(cookie, 'SECRETKEY');
  // console.log(`CHECKVALIDSESSION ${username} ${sid} ${ip}`);
  model.extendSessionIfValid(username, sid, ip).then((isValid) => {
    if (isValid) {
      return res.status(200).send({
        msg: 'Successfully refreshed session',
      });
    }
    return res.status(403).send({
      msg: 'Your session has expired. Please log in again',
    });
  }).catch((err) => {
    console.log(err);
  });
});

module.exports = { router };
