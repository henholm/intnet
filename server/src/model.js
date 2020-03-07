/* jslint node: true */

'use strict';

const User = require('./models/user.model');
const Database = require('./sequelize');

const users = {};

/**
 * unregisteredSockets is used as a temporary pool of sockets belonging to users
 * who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - configs needed to init. the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;

  unregisteredSockets[socketID] = socket;
  return socketID;
};

const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, socketID = undefined) => {
  users[name] = new User(name);
  if (socketID !== undefined) {
    users[name].socket = assignUnregisteredSocket(socketID);
  }
};

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (name, socket) => {
  users[name].socket = socket;
};

/**
 * Returns the user object with the given name.
 * @param {String} name - The name of the user.
 * @returns {User}
 */
exports.findUser = (name) => users[name];

/**
 * Returns all time slots.
 * @returns {TimeSlot[]}
 */
exports.getTimeSlotsWithPwords = () => Database.selectAllTimeSlots();

/**
 * Returns all time slots.
 * @returns {TimeSlot[]}
 */
exports.getTimeSlots = () => Database.selectAllTimeSlotsClean();

/**
 * Returns all time slots.
 * @returns {TimeSlot[]}
 */
exports.getTimeSlotById = (timeSlotId) => Database.selectTimeSlotByIdClean(timeSlotId);

exports.getTimeSlotByIdDirty = (timeSlotId) => Database.selectTimeSlotByIdDirty(timeSlotId);

exports.setTimeSlotBookedBy = (timeSlotId, bookedByWhom) => (
  Database.alterTimeSlotState(timeSlotId, bookedByWhom)
);

exports.selectTimeSlot = (timeSlotId) => (
  new Promise((resolve, reject) => {
    Database.TimeSlot.findOne({
      where: {
        id: timeSlotId,
      },
      include: [{
        model: Database.Assistant,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlot) => {
      const cleanTimeSlot = {
        id: dirtyTimeSlot.id,
        time: dirtyTimeSlot.time,
        assistantId: dirtyTimeSlot['Assistant.id'],
        assistantName: dirtyTimeSlot['Assistant.name'],
      };
      resolve(cleanTimeSlot);
    }).catch((err) => {
      console.log('Error in selectTimeSlot');
      console.log(err);
      reject(err);
    });
  })
);

exports.authenticateAssistant = (assistantName, assistantPassword) => (
  Database.authenticateAllegedAssistant(assistantName, assistantPassword)
);

exports.authenticateUser = (userName, userPassword) => (
  // Database.authenticateAllegedAssistant(userName, userPassword)
  Database.authenticateAllegedUser(userName, userPassword)
);

exports.loginUser = (userName, userPassword) => (
  // Database.authenticateAllegedAssistant(userName, userPassword)
  Database.loginAllegedUser(userName, userPassword)
);

exports.getAssistantTimeSlots = (assistantName) => (
  Database.selectTimeSlotsByAssistantName(assistantName)
);

exports.removeTimeSlot = (timeSlotId) => Database.removeTimeSlot(timeSlotId);

exports.addTimeSlot = (assistantName, timeSlotId) => (
  Database.addTimeSlot(assistantName, timeSlotId)
);

exports.userLogOut = (userId) => Database.setLoggedIn(userId, 0);
