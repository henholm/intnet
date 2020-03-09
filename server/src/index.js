/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
const betterLogging = require('better-logging'); // enhances log messages with timestamps etc
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
const https = require('https');
const fs = require('fs');
const helmet = require('helmet'); // For Content-Security-Policy.
const bodyParser = require('body-parser');
const history = require('connect-history-api-fallback'); // For page refresh.
const timeout = require('connect-timeout');
// #endregion


// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.use(timeout('5s'));

// Middleware which allows for page refreshing.
app.use(history({
  verbose: true,
}));

app.use(haltOnTimedout);

// Express usually does this for us, but socket.io needs the httpServer directly
const httpsServer = https.createServer({
  key: fs.readFileSync('./certs/localhost.key'),
  cert: fs.readFileSync('./certs/localhost.crt'),
}, app);


// const httpServer = http.Server(app);
const io = require('socket.io').listen(httpsServer); // Creates socket.io app


// ------------------------------------ CSP ------------------------------------
// // Use helmet (from npm install helmet) for setting Content Security Policies.
// // This prevents cross-site scripting among other things.
app.use(helmet.contentSecurityPolicy({
  directives: {
    // Upgrades http to https (provided we also serve http requests).
    upgradeInsecureRequests: true,
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'cdnjs.cloudflare.com', 'ajax.googleapis.com',
      'maxcdn.bootstrapcdn.com'],
    styleSrc: ["'self'", 'cdnjs.cloudflare.com', 'ajax.googleapis.com',
      'maxcdn.bootstrapcdn.com'],
    fontSrc: ["'self'", 'cdnjs.cloudflare.com', 'ajax.googleapis.com',
      'maxcdn.bootstrapcdn.com'],
    reportUri: '/report-violation',
  },
  // browserSniff: false,
}));

app.use(haltOnTimedout);

// JSON parser for logging CSP violations.
app.use(bodyParser.json({
  type: ['json', 'application/csp-report'],
}));

app.use(haltOnTimedout);

// https://helmetjs.github.io/docs/csp/
app.post('/report-violation', (req, res) => {
  if (req.body) {
    console.log('CSP Violation: ', req.body);
  } else {
    console.log('CSP Violation: No data received!');
  }
  res.status(204).end();
});
// -----------------------------------------------------------------------------


// ---------------------------- Parsing and logging ----------------------------
// Setup middlewares.
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));

app.use(haltOnTimedout);

/* This is a middleware that parses the body of the request into a javascript
   object. It's basically just replacing the body property like this:
   req.body = JSON.parse(req.body) */
app.use(express.json());

app.use(haltOnTimedout);

app.use(express.urlencoded({ extended: true }));

app.use(haltOnTimedout);
// -----------------------------------------------------------------------------


// ------------------------------- Init session --------------------------------
// Setup session
const maxAge = 60 * 60 * 1000; // 1 hour
const session = expressSession({
  name: 'sessionId',
  secret: 'Super secret! Shh! Don\'t tell anyone...',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge,
  },
});
app.use(session);
app.use(haltOnTimedout);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));

// This will serve static files from the public directory, starting with index.html
app.use(express.static(publicPath));
app.use(haltOnTimedout);
// -----------------------------------------------------------------------------


// -------------------------------- Middleware ---------------------------------
// Bind REST controllers to /api/*
const authController = require('./controllers/auth.controller.js');

app.use('/api', authController.router);
app.use(haltOnTimedout);
// -----------------------------------------------------------------------------


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


// const timeoutHandles = {};
const timeoutHandlesMap = new Map();


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
    const timeSlotId = message.id;
    if (message.bookedBy === 'reserved') {
      // If the Timeout object already exists, clear it.
      if (timeoutHandlesMap.has(timeSlotId)) {
        const timeoutHandle = timeoutHandlesMap.get(timeSlotId);
        clearTimeout(timeoutHandle);
      }
      // Instantiate a new Timeout object.
      const timeoutHandle = setTimeout(resetTimeSlot, 21000, message);
      timeoutHandlesMap.set(timeSlotId, timeoutHandle);
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

// Start server.
// httpServer.listen(port, () => {
httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});
