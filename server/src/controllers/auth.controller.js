/* jslint node: true */

'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const model = require('../model.js');
const userMiddleware = require('../middleware/users.js');

const router = express.Router();

/**
 * Fetch the list of existing courses.
 * @returns {void}
 */
router.post('/courses', userMiddleware.isLoggedIn, async (req, res) => {
  const { userId } = req.body;
  const { isAssistant } = req.body;
  const { isAdmin } = req.body;

  const attendsCourses = [];
  const assistsCourses = [];
  const administersCourses = [];
  try {
    if (isAdmin === 1) {
      // In this case, return all courses.
      const courses = await model.getCourses();
      for (let i = 0; i < courses.length; i += 1) {
        const course = {
          id: courses[i].id,
          name: courses[i].name,
        };
        administersCourses.push(course);
      }
    } else if (isAssistant === 1) {
      // In this case, get courses which the assistant attends ...
      const attendingCourses = await model.getAttendingCourses(userId);
      for (let i = 0; i < attendingCourses.length; i += 1) {
        const attendingCourse = {
          id: attendingCourses[i].id,
          name: attendingCourses[i].name,
        };
        attendsCourses.push(attendingCourse);
      }
      // ... and assists.
      const assistingCourses = await model.getAssistingCourses(userId);
      for (let i = 0; i < assistingCourses.length; i += 1) {
        const assistingCourse = {
          id: assistingCourses[i].id,
          name: assistingCourses[i].name,
        };
        assistsCourses.push(assistingCourse);
      }
    } else {
      // In this case, get courses which the student attends.
      const attendingCourses = await model.getAttendingCourses(userId);
      for (let i = 0; i < attendingCourses.length; i += 1) {
        const attendingCourse = {
          id: attendingCourses[i].id,
          name: attendingCourses[i].name,
        };
        attendsCourses.push(attendingCourse);
      }
    }
  } catch (err) {
    console.log(err);
  }

  const response = {
    attendsCourses,
    assistsCourses,
    administersCourses,
  };

  res.status(200).json({
    response,
  });
});

router.post('/users', userMiddleware.isLoggedIn, async (req, res) => {
  let admins = [];
  let assistants = [];
  let students = [];

  try {
    admins = await model.getAdmins();
    assistants = await model.getAssistantsForCourse(req.body.courseName);
    students = await model.getStudentsForCourse(req.body.courseName);
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({
    courseName: req.body.courseName,
    admins,
    assistants,
    students,
  });
});

/**
 * Fetch the list of existing time slots for the specified course.
 * @returns {void}
 */
router.post('/courses/:courseName/timeSlots', userMiddleware.isLoggedIn, (req, res) => {
  model.getTimeSlotsForCourse(req.body.courseName).then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
  });
});

/**
 * Fetch the list of existing time slots for the input assistant.
 * @returns {void}
 */
router.post('/courses/:courseName/:username', userMiddleware.isLoggedIn, (req, res) => {
  model.getTimeSlotsForAssistant(req.body.username).then((resolve) => {
    res.status(200).json({
      timeSlots: resolve,
    });
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
  model.getTimeSlotById(req.body.timeSlotId, req.body.reservedBy).then((resolve) => {
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
      const { isAdmin } = userData;
      const user = {
        username,
        userId,
        isAssistant,
        isAdmin,
      };

      const token = jwt.sign({
        username,
        userId,
        isAssistant,
        isAdmin,
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
