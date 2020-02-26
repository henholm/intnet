/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
const betterLogging = require('better-logging');
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: (Color) => Color.Light_Green,
  typeColors: (Color) => ({
    log: Color.Light_Green,
  }),
});
const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const http = require('http');
// #endregion

// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Express usually does this for us, but socket.io needs the httpServer directly
const httpServer = http.Server(app);
const io = require('socket.io').listen(httpServer); // Creates socket.io app

// Setup middlewares
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));
app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.urlencoded({ extended: true }));

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Don\'t tell anyone...',
  resave: true,
  saveUninitialized: true,
});
app.use(session);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));
// #endregion

// Serve client
app.use(express.static(publicPath));/*
express.static(absolutePathToPublicDirectory)
This will serve static files from the public directory, starting with index.html
*/

// Bind REST controllers to /api/*
const chat = require('./controllers/socket.controller.js');

app.use('/api', chat.router);

// Init model
const model = require('./model.js');

// Initialize server
model.init({ io });

function resetTimeSlot(message) {
  model.getTimeSlotByIdDirty(message.id).then((timeSlot) => {
    // If the timeSlot is still 'reserved' after 20 seconds, reset it.
    if (timeSlot.bookedBy === 'reserved') {
      model.setTimeSlotBookedBy(message.id, 'no one').then(() => {
        // Broadcast to others after the update has been recognized server-wise.
        model.getTimeSlots().then((timeSlots) => {
          io.emit('update', { timeSlots });
        }).catch((err) => {
          console.log('Error in getTimeSlots in resetTimeSlot');
          console.log(err);
        });
      }).catch((err) => {
        console.log('Error in setTimeSlotBookedBy in resetTimeSlot');
        console.log(err);
      });
    }
  }).catch((err) => {
    console.log('Error in getTimeSlotById in resetTimeSlot');
    console.log(err);
  });
}

// Handle connected socket.io sockets. Add extra listeners.
io.on('connection', (socket) => {
  // This function serves to bind socket.io connections to user models
  if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  }

  socket.on('changeState', (message) => {
    console.log('changeState');
    if (message.bookedBy === 'reserved') {
      // setTimeout(() => socket.disconnect(true), 20000});
      // payload = { message: message, io: io };
      setTimeout(resetTimeSlot, 21000, message);
    }
    model.setTimeSlotBookedBy(message.id, message.bookedBy).then(() => {
      // Broadcast to others after the update has been recognized server-wise.
      model.getTimeSlots().then((timeSlots) => {
        socket.broadcast.emit('update', { timeSlots });
      }).catch((err) => {
        console.log('Error after getTimeSlots in changeState');
        console.log(err);
      });
      // socket.broadcast.emit('update', { message });
    }).catch((err) => {
      console.log('Error after setTimeSlotBookedBy / in broadcast.emit');
      console.log(err);
    });
  });

  socket.on('removeTimeSlot', (message) => {
    console.log('removeTimeSlot');
    model.removeTimeSlot(message.id).then(() => {
      model.getTimeSlots().then((timeSlots) => {
        // socket.broadcast.emit('update', { timeSlots });
        io.emit('update', { timeSlots });
      }).catch((err) => {
        console.log('Error in on.removeTimeSlot in getTimeSlots');
        console.log(err);
      });
    }).catch((err) => {
      console.log('Error in on.removeTimeSlot in removeTimeSlot');
      console.log(err);
    });
  });

  socket.on('addTimeSlot', (message) => {
    console.log('addTimeSlot');
    console.log(message);
    console.log(message.time);
    console.log(message.name);
    model.addTimeSlot(message.name, message.time).then(() => {
      model.getTimeSlots().then((timeSlots) => {
        // socket.broadcast.emit('update', { timeSlots });
        io.emit('update', { timeSlots });
      }).catch((err) => {
        console.log('Error in on.addTimeSlot in getTimeSlots');
        console.log(err);
      });
    }).catch((err) => {
      console.log('Error in on.addTimeSlot in removeTimeSlot');
      console.log(err);
    });
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
