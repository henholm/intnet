/* jslint node: true */

'use strict';

const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 * @param {Request} req
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  const maybeUser = model.findUser(req.session.userID);

  // "auth" check
  if (maybeUser === undefined) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }

  next();
};

/**
 * Tells the client if they are in an authenticated user-session.
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/isAuthenticated', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  res.status(200).json({
    isAuthenticated: maybeUser !== undefined,
    username: maybeUser !== undefined ? maybeUser.name : 'N/A',
  });
});

/**
 * Attempts to authenticate the user-session
 * @param {String} req.body.username - The username of the user attempting to authenticate
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/authenticate', (req, res) => {
  console.log('/authenticate');
  // TODO: distinctions between temporary/persistent storage modules.
  model.authenticateUser(req.body.username, req.body.password).then((resolve) => {
    model.addUser(req.body.username, req.session.socketID);
    // Update the userID of the currently active session
    req.session.userID = req.body.username;
    req.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved userID: ${req.session.userID}`);
    });
    res.sendStatus(200).json({
      isAuthenticated: resolve,
    });
  }).catch((err) => {
    console.log('Error in router.post(/authenticate)');
    console.log(err);
  });
});

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

// TODO: Add 'create account' route.
// The 'authenticate' route is only supposed to check if the user can login.

module.exports = { router, requireAuth };
