// This file is used to bootstrap our ORM and define relationships. The models
// are defined within the /models folder. index.js is the Express app.

'use strict';

const path = require('path');
const bcrypt = require('bcrypt');
// const { Sequelize, Model, DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');
const UserModel = require('./models/user');
const AssistantModel = require('./models/assistant');
const TimeSlotModel = require('./models/timeslot');

const databasePath = path.join(__dirname, 'db.sqlite');
const sequelize = new Sequelize({
  // host: 'localhost',
  dialect: 'sqlite',
  storage: databasePath,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Instantiate models using our instance of Sequelize.
const User = UserModel(sequelize, Sequelize);
const Assistant = AssistantModel(sequelize, Sequelize);
const TimeSlot = TimeSlotModel(sequelize, Sequelize, Assistant);

// All Assistants are Users / some Users are Assistants.
// Assistant.hasOne(User);
Assistant.belongsTo(User, { foreignKey: 'id' });

// One Assistant has potentially several TimeSlots.
Assistant.hasMany(TimeSlot);
// Relate TimeSlots table to Assistants table using foreign key 'assistantId'.
TimeSlot.belongsTo(Assistant, { foreignKey: 'assistantId' });

exports.User = User;
exports.Assistant = Assistant;
exports.TimeSlot = TimeSlot;
// exports.Session = Session;

// Function for toggling the isLoggedIn attribute of a user.
function setLoggedIn(userId, toggleTo) {
  return new Promise((resolve, reject) => {
    User.update(
      { isLoggedIn: toggleTo },
      { where: { id: userId } },
    ).then((numUpdatedRows) => {
      resolve(numUpdatedRows);
    }).catch((err) => {
      console.log('Error in setLoggedIn');
      console.log(err);
      reject(err);
    });
  });
}


function resetReservedTimeSlots() {
  TimeSlot.update(
    { bookedBy: 'no one' },
    { where: { bookedBy: 'reserved' } },
  ).catch((err) => {
    throw err;
  });
}

// If the server was shut down before a timeslot booking session was terminated,
// reset all reserved time slots to be "open".
resetReservedTimeSlots();

function resetLoggedInIfExpired() {
  User.findAll({ where: { isLoggedIn: 1 } }).then((loggedInUsers) => {
    if (loggedInUsers) {
      for (let i = 0; i < loggedInUsers.length; i += 1) {
        const loggedInUser = loggedInUsers[i];
        if (loggedInUser.sessionExpires < Date.now()) {
          setLoggedIn(loggedInUser.id, 0);
        }
      }
    }
  }).catch((err) => {
    throw err;
  });
}

function resetLoggedIn() {
  User.update(
    { isLoggedIn: 0 },
    { where: { isLoggedIn: 1 } },
  ).catch((err) => {
    throw err;
  });
}

// If the server was shut down before a the LoggedIn status of users was reset,
// reset the isLoggedIn attribute of all Users.
// resetLoggedIn();
resetLoggedInIfExpired();

function setSession(userId, sid, sessionExpires) {
  return new Promise((resolve, reject) => {
    User.update(
      {
        sessionId: sid,
        sessionExpires,
      },
      { where: { id: userId } },
    ).then((numUpdatedRows) => {
      resolve(numUpdatedRows);
    }).catch((err) => {
      console.log('Error in setSession');
      console.log(err);
      reject(err);
    });
  });
}

exports.setLoggedIn = setLoggedIn;
exports.resetLoggedInIfExpired = resetLoggedInIfExpired;

// Update TimeSlot table: set the value of booked_by to bookedByWhom in the time
// slot (i.e. row) where the id = timeSlotId.
exports.alterTimeSlotState = (timeSlotId, bookedByWhom) => (
  new Promise((resolve, reject) => {
    TimeSlot.update(
      { bookedBy: bookedByWhom },
      { returning: true, where: { id: timeSlotId } },
    ).then((numUpdatedRows) => {
      console.log(`numUpdatedRows: ${numUpdatedRows[1]}`);
      resolve(numUpdatedRows[1]);
    }).catch((err) => {
      console.log('Error in alterTimeSlotState');
      console.log(err);
      reject(err);
    });
  })
);

// SELECT * FROM time_slots INNER JOIN assistants ON time_slots.assistant_id == assistants.id;
exports.selectAllTimeSlotsDirty = () => {
  TimeSlot.findAll({
    include: [{
      model: Assistant,
      required: true,
    }],
  }).then((result) => {
    console.log(result);
    return result;
  }).catch((err) => {
    console.log('Error in selectAllTimeSlotsDirty');
    console.log(err);
  });
};

// Same as selectAllTimeSlotsDirty() but removes sensitive data like passwords.
exports.selectAllTimeSlotsClean = () => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      include: [{
        model: Assistant,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlots) => {
      // let cleanTimeSlots = new Map();
      const cleanTimeSlots = [];
      for (let i = 0; i < dirtyTimeSlots.length; i += 1) {
        const dirtyTimeSlot = dirtyTimeSlots[i];
        const cleanTimeSlot = {
          id: dirtyTimeSlot.id,
          bookedBy: dirtyTimeSlot.bookedBy,
          time: dirtyTimeSlot.time,
          assistantId: dirtyTimeSlot['Assistant.id'],
          assistantName: dirtyTimeSlot['Assistant.name'],
        };
        // cleanTimeSlots.set(cleanTimeSlot.id, cleanTimeSlot);
        cleanTimeSlots.push(cleanTimeSlot);
      }
      resolve(cleanTimeSlots);
    }).catch((err) => {
      console.log('Error in selectAllTimeSlotsClean');
      console.log(err);
      reject(err);
    });
  })
);

// Selects time slot as specified by input timeslot id. Inner join with Assistant.
exports.selectTimeSlotByIdDirty = (timeSlotId) => (
  new Promise((resolve, reject) => {
    TimeSlot.findOne({
      where: {
        id: timeSlotId,
      },
      include: [{
        model: Assistant,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlot) => {
      resolve(dirtyTimeSlot);
    }).catch((err) => {
      console.log('Error in selectTimeSlot');
      console.log(err);
      reject(err);
    });
  })
);

// Selects time slot as specified by input timeslot id. Inner join with Assistant.
exports.selectTimeSlotByIdClean = (timeSlotId) => (
  new Promise((resolve, reject) => {
    TimeSlot.findOne({
      where: {
        id: timeSlotId,
      },
      include: [{
        model: Assistant,
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
      if (dirtyTimeSlot.bookedBy !== 'no one') {
        reject();
      }
      resolve(cleanTimeSlot);
    }).catch((err) => {
      console.log('Error in selectTimeSlot');
      console.log(err);
      reject(err);
    });
  })
);

exports.selectAssistantIdFromName = (assistantName) => (
  new Promise((resolve, reject) => {
    Assistant.findOne({
      where: {
        name: assistantName,
      },
    }).then((assistant) => {
      resolve(assistant.id);
    }).catch((err) => {
      console.log('Error in selectAssistantIdFromName');
      console.log(err);
      reject(err);
    });
  })
);

// Selects time slot as specified by input assistant id. Inner join with Assistant.
exports.selectTimeSlotsByAssistantId = (assistantId) => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      where: {
        assistant_id: assistantId,
      },
      raw: true,
    }).then((timeSlots) => {
      resolve(timeSlots);
    }).catch((err) => {
      console.log('Error in selectTimeSlotByAssistantId');
      console.log(err);
      reject(err);
    });
  })
);

exports.selectTimeSlotsByAssistantName = (assistantName) => (
  new Promise((resolve, reject) => {
    exports.selectAssistantIdFromName(assistantName).then((assistantId) => {
      exports.selectTimeSlotsByAssistantId(assistantId).then((timeSlots) => {
        resolve(timeSlots);
      }).catch((err) => {
        console.log('Error in selectTimeSlotsByAssistantId in selectTimeSlotsByAssistantName');
        console.log(err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error in selectAssistantIdFromName in selectTimeSlotsByAssistantName');
      console.log(err);
      reject(err);
    });
  })
);

exports.selectStudentIdFromName = (studentName) => (
  new Promise((resolve, reject) => {
    User.findOne({
      where: {
        name: studentName,
      },
    }).then((student) => {
      resolve(student.id);
    }).catch((err) => {
      console.log('Error in selectStudentIdFromName');
      console.log(err);
      reject(err);
    });
  })
);

exports.selectTimeSlotsByStudentName = (studentName) => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      where: {
        bookedBy: studentName,
      },
      raw: true,
    }).then((timeSlots) => {
      resolve(timeSlots);
    }).catch((err) => {
      console.log('Error in selectTimeSlotsByStudentName');
      console.log(err);
      reject(err);
    });
  })
);

exports.authenticateAllegedAssistant = (assistantName, assistantPassword) => (
  new Promise((resolve, reject) => {
    Assistant.findOne({
      where: {
        name: assistantName,
      },
      raw: true,
    }).then((assistant) => {
      if (!assistant) {
        resolve(false);
      }
      const hashedTruePassword = assistant.password;
      bcrypt.compare(assistantPassword, hashedTruePassword).then((res) => {
        resolve(res);
      }).catch((err) => {
        console.log('Error in bcrypt.compare');
        console.log(err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error in authenticateAllegedAssistant');
      console.log(err);
      reject(err);
    });
  })
);

exports.authenticateAllegedUser = (userName, userPassword) => (
  new Promise((resolve, reject) => {
    console.log(userName);
    console.log(userPassword);
    console.log('authenticateAllegedUser');
    User.findOne({
      where: {
        name: userName,
      },
      raw: true,
    }).then((user) => {
      // User does not exist.
      if (!user) resolve(false);

      // Check password if user exists.
      const hashedTruePassword = user.password;
      bcrypt.compare(userPassword, hashedTruePassword).then((res) => {
        // Resolve with true of false depending on whether the password matched
        // or not.
        resolve(res);
      }).catch((err) => {
        console.log('Error in bcrypt.compare');
        console.log(err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error in authenticateAllegedAssistant');
      console.log(err);
      reject(err);
    });
  })
);

exports.loginAllegedUser = (userName, userPassword, sid, sessionExpires) => (
  new Promise((resolve, reject) => {
    resetLoggedInIfExpired();
    User.findOne({
      where: {
        name: userName,
      },
      raw: true,
    }).then((user) => {
      // User does not exist.
      if (!user) {
        const response = { userId: false, msg: 'User or password incorrect' };
        resolve(response);
      }
      // Check password if user exists.
      const hashedTruePassword = user.password;
      bcrypt.compare(userPassword, hashedTruePassword).then((res) => {
        if (res && user.isLoggedIn === 1 && user.sessionId !== sid) {
          // Passwords matched, but user is already logged in elsewhere.
          const response = { userId: false, msg: `${userName} is already logged in` };
          resolve(response);
        } else if (res && user.isLoggedIn === 1 && user.sessionId === sid) {
          // In this case, simply renew the sessionExpires attribute.
          setSession(user.id, sid, sessionExpires);
          const userData = { userId: user.id, username: user.name, isAssistant: user.isAssistant };
          const response = { userData, msg: `Successfully renewed session for ${userName}` };
          resolve(response);
        } else if (res && user.isLoggedIn !== 1) {
          // Resolve with userData if passwords matched and user is not logged in.
          setLoggedIn(user.id, 1);
          setSession(user.id, sid, sessionExpires);
          const userData = {
            userId: user.id,
            username: user.name,
            isAssistant: user.isAssistant,
          };
          const response = { userData, msg: `${userName} logged in successfully` };
          resolve(response);
        } else {
          // Resolve with false if passwords did not match.
          const response = { userId: false, msg: 'User or password incorrect' };
          resolve(response);
        }
      }).catch((err) => {
        console.log('Error in bcrypt.compare');
        console.log(err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error in authenticateAllegedAssistant');
      console.log(err);
      reject(err);
    });
  })
);

// Add a new TimeSlot for the Assistant specified by the input name.
exports.addTimeSlot = (assistantName, time) => (
  new Promise((resolve, reject) => {
    Assistant.findOne({
      where: {
        name: assistantName,
      },
      raw: true,
    }).then((assistant) => {
      TimeSlot.create({
        assistantId: assistant.id,
        bookedBy: 'no one',
        time,
      }).then((newTimeSlot) => {
        console.log(newTimeSlot.toJSON());
        resolve(newTimeSlot);
      }).catch((err) => {
        console.log('Error in TimeSlot.create in addTimeSlot');
        console.log(err);
        reject(err);
      });
    }).catch((err) => {
      console.log('Error in Assistant.findOne in addTimeSlot');
      console.log(err);
      reject(err);
    });
  })
);

// Remove TimeSlot corresponding to the input ID.
exports.removeTimeSlot = (idOfTimeSlot) => (
  new Promise((resolve, reject) => {
    TimeSlot.destroy(
      {
        where: { id: idOfTimeSlot },
        force: true,
      },
    ).then((result) => {
      console.log(`numRemovedRows: ${result}`);
      resolve(result);
    }).catch((err) => {
      console.log('Error in removeTimeSlot in TimeSlot.destroy');
      console.log(err);
      reject(err);
    });
  })
);

exports.setLoggedInIfNot = (userId) => (
  new Promise((resolve, reject) => {
    User.findOne({
      where: {
        id: userId,
      },
      raw: true,
    }).then((user) => {
      if (user.isLoggedIn !== 1) {
        setLoggedIn(user.id, 1).then(() => resolve(true));
      } else {
        resolve(false);
      }
    }).catch((err) => {
      console.log('Error in setLoggedInIfNot User.findOne');
      reject(err);
    });
  })
);

exports.extendSessionIfValid = (username, sid, sessionExpires) => (
  new Promise((resolve, reject) => {
    // Set the isLoggedIn attribute of all expired sessions to 0.
    // resetLoggedInIfExpired();
    User.findOne({
      where: {
        name: username,
      },
      raw: true,
    }).then((user) => {
      // User does not exist: invalid.
      // if (!user) resolve({ msg: 'No such user' });
      if (!user) resolve(false);

      // Not the same session: invalid.
      if (user.sessionId !== sid) resolve(false);

      // Session already expired: invalid.
      if (user.isLoggedIn === 0) resolve(false);

      // In this case, the session is still valid. Refresh it and resolve with true.
      if (user.isLoggedIn === 1) {
        setSession(user.id, sid, sessionExpires);
        resolve(true);
      }
    }).catch((err) => {
      console.log('Error in extendSessionIfValid');
      console.log(err);
      reject(err);
    });
  })
);
