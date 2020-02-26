/* jslint node: true */

'use strict';

const express = require('express');
const model = require('../model.js');

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

module.exports = { router };
