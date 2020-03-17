// This file is used to bootstrap our ORM and define relationships. The models
// are defined within the /models folder. index.js is the Express app.

'use strict';

const path = require('path');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const UserModel = require('./models/user');
const TimeSlotModel = require('./models/timeSlot');
const CourseModel = require('./models/course');
const AssistsCourseModel = require('./models/assistsCourse');
const AttendsCourseModel = require('./models/attendsCourse');

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
const Course = CourseModel(sequelize, Sequelize);
const AssistsCourse = AssistsCourseModel(sequelize, Sequelize, User, Course);
const AttendsCourse = AttendsCourseModel(sequelize, Sequelize, User, Course);
const TimeSlot = TimeSlotModel(sequelize, Sequelize, User);

// One Assistant (who is a User) potentially has several TimeSlots (or none).
User.hasMany(TimeSlot);
TimeSlot.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

// One Assistant (who is a User) potentially assists several Course (or none).
AssistsCourse.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
User.hasMany(AssistsCourse);

// One Course is potentially assisted by several Assistants (or none).
AssistsCourse.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id' });
Course.hasMany(AssistsCourse);

// One Course is potentially attended by several Students (or none).
AttendsCourse.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id' });
Course.hasMany(AttendsCourse);

exports.User = User;
exports.Course = Course;
exports.AssistsCourse = AssistsCourse;
exports.AttendsCourse = AttendsCourse;
exports.TimeSlot = TimeSlot;

// Function for toggling the isLoggedIn attribute of a user.
function setLoggedIn(userId, toggleTo) {
  // return new Promise((resolve, reject) => {
  User.update(
    { isLoggedIn: toggleTo },
    { where: { id: userId } },
  )
    // .then((numUpdatedRows) => {
    //   resolve(numUpdatedRows);
    // }).catch((err) => {
    //   reject(err);
  //   });
  // });
}

function resetReservedTimeSlots() {
  TimeSlot.update(
    { isReserved: 0 },
    { where: { isReserved: 1 } },
  )
  // .catch((err) => {
  //   throw err;
  // });
}

// If the server was shut down before a timeslot booking session was terminated,
// reset the isReserved attribute of all time slots to 0 (i.e. "false").
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

resetLoggedInIfExpired();

function setSession(userId, sid, sessionExpires, ip) {
  // return new Promise((resolve, reject) => {
  User.update(
    {
      sessionId: sid,
      sessionExpires,
      lastIpAddress: ip,
    },
    { where: { id: userId } },
  )
  //   ).then((numUpdatedRows) => {
  //     resolve(numUpdatedRows);
  //   }).catch((err) => {
  //     reject(err);
  //   });
  // });
}

exports.setLoggedIn = setLoggedIn;
exports.resetLoggedInIfExpired = resetLoggedInIfExpired;

// Set isReserved to 0, isBooked to 1 and bookedBy to bookedByWhom for time slot.
exports.alterTimeSlotState = (timeSlotId, bookedByWhom) => (
  // new Promise((resolve, reject) => {
  TimeSlot.update(
    {
      isReserved: 0,
      isBooked: 1,
      bookedBy: bookedByWhom,
    },
    { returning: true, where: { id: timeSlotId } },
  )
  //   .then((numUpdatedRows) => {
  //     resolve(numUpdatedRows[1]);
  //   }).catch((err) => {
  //     reject(err);
  //   });
  // })
);

exports.setTimeSlotAttributes = (timeSlotId, isReserved, isBooked, bookedBy) => (
  TimeSlot.update(
    {
      isReserved,
      isBooked,
      bookedBy,
    },
    { returning: true, where: { id: timeSlotId } },
  )
);

// SELECT * FROM time_slots INNER JOIN users ON time_slots.user_id == users.id;
// Same as selectAllTimeSlotsDirty() but removes sensitive data like passwords.
exports.selectAllTimeSlotsClean = () => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      include: [{
        model: User,
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
          isReserved: dirtyTimeSlot.isReserved,
          isBooked: dirtyTimeSlot.isBooked,
          // bookedBy: dirtyTimeSlot.bookedBy,
          time: dirtyTimeSlot.time,
          assistantId: dirtyTimeSlot['User.id'],
          assistantName: dirtyTimeSlot['User.name'],
        };
        cleanTimeSlots.push(cleanTimeSlot);
      }
      resolve(cleanTimeSlots);
    }).catch((err) => {
      reject(err);
    });
  })
);

// Selects time slot as specified by input timeslot id. Inner join with User.
exports.selectTimeSlotByIdDirty = (timeSlotId) => (
  // new Promise((resolve, reject) => {
  TimeSlot.findOne({
    where: {
      id: timeSlotId,
    },
    include: [{
      model: User,
      required: true,
    }],
    raw: true,
  })
  //   .then((dirtyTimeSlot) => {
  //     resolve(dirtyTimeSlot);
  //   }).catch((err) => {
  //     reject(err);
  //   });
  // })
);

// Selects time slot as specified by input timeslot id. Inner join with User.
exports.selectTimeSlotByIdClean = (timeSlotId) => (
  new Promise((resolve, reject) => {
    TimeSlot.findOne({
      where: {
        id: timeSlotId,
      },
      include: [{
        model: User,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlot) => {
      const cleanTimeSlot = {
        id: dirtyTimeSlot.id,
        time: dirtyTimeSlot.time,
        assistantId: dirtyTimeSlot['User.id'],
        assistantName: dirtyTimeSlot['User.name'],
      };
      // This breaks refreshing of the bookTimeSlot view as it sends back the
      // user to the timeSlots view. Could be solved by adding reservedBy.
      if (dirtyTimeSlot.isReserved !== 0) {
        reject();
      }
      resolve(cleanTimeSlot);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.selectUserIdFromName = (userName) => (
  new Promise((resolve, reject) => {
    User.findOne({
      where: {
        name: userName,
      },
    }).then((user) => {
      resolve(user.id);
    }).catch((err) => {
      reject(err);
    });
  })
);

// Selects time slot as specified by input assistant ID. Inner join with User.
exports.selectTimeSlotsByAssistantId = (assistantId) => (
  // new Promise((resolve, reject) => {
  TimeSlot.findAll({
    where: {
      user_id: assistantId,
    },
    raw: true,
  })
  //   .then((timeSlots) => {
  //     resolve(timeSlots);
  //   }).catch((err) => {
  //     console.log('Error in selectTimeSlotByUserId');
  //     console.log(err);
  //     reject(err);
  //   });
  // })
);

exports.selectTimeSlotsByAssistantName = (assistantName) => (
  new Promise((resolve, reject) => {
    exports.selectUserIdFromName(assistantName).then((assistantId) => {
      exports.selectTimeSlotsByAssistantId(assistantId).then((timeSlots) => {
        resolve(timeSlots);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
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
      reject(err);
    });
  })
);

exports.selectTimeSlotsByStudentName = (studentName) => (
  // new Promise((resolve, reject) => {
  TimeSlot.findAll({
    where: {
      bookedBy: studentName,
    },
    raw: true,
  })
  //   .then((timeSlots) => {
  //     resolve(timeSlots);
  //   }).catch((err) => {
  //     console.log('Error in selectTimeSlotsByStudentName');
  //     console.log(err);
  //     reject(err);
  //   });
  // })
);

exports.loginAllegedUser = (userName, userPassword, sid, ip) => (
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
        const nowTimeStamp = Date.now();
        const sessionExpires = nowTimeStamp + (30 * 1000); // Valid for 30 seconds.
        if (res && user.isLoggedIn === 1 && user.sessionId !== sid) {
          // Passwords matched, but user is already logged in elsewhere.
          const response = { userData: null, msg: `${userName} is already logged in` };
          resolve(response);
        } else if (res && user.isLoggedIn === 1 && user.sessionId === sid) {
          // In this case, simply renew the sessionExpires attribute.
          setSession(user.id, sid, sessionExpires, ip);
          const userData = { userId: user.id, username: user.name, isAssistant: user.isAssistant };
          const response = { userData, msg: `Successfully renewed session for ${userName}` };
          resolve(response);
        } else if (res && user.isLoggedIn !== 1) {
          // Resolve with userData if passwords matched and user is not logged in.
          setLoggedIn(user.id, 1);
          setSession(user.id, sid, sessionExpires, ip);
          const userData = { userId: user.id, username: user.name, isAssistant: user.isAssistant };
          const response = { userData, msg: `${userName} logged in successfully` };
          resolve(response);
        } else {
          // Resolve with false if passwords did not match.
          const response = { userData: null, msg: 'User or password incorrect' };
          resolve(response);
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  })
);

// Add a new TimeSlot for the Assistant specified by the input name.
exports.addTimeSlot = (assistantName, time) => (
  new Promise((resolve, reject) => {
    User.findOne({
      where: {
        name: assistantName,
      },
      raw: true,
    }).then((assistant) => {
      TimeSlot.create({
        userId: assistant.id,
        isReserved: 0,
        isBooked: 0,
        bookedBy: null,
        time,
      }).then((newTimeSlot) => {
        resolve(newTimeSlot);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  })
);

// Remove TimeSlot corresponding to the input ID.
exports.removeTimeSlot = (idOfTimeSlot) => (
  // new Promise((resolve, reject) => {
  TimeSlot.destroy(
    {
      where: { id: idOfTimeSlot },
      force: true,
    },
  )
  //   .then((result) => {
  //     console.log(`numRemovedRows: ${result}`);
  //     resolve(result);
  //   }).catch((err) => {
  //     console.log('Error in removeTimeSlot in TimeSlot.destroy');
  //     console.log(err);
  //     reject(err);
  //   });
  // })
);


exports.extendSessionIfValid = (username, sid, ip) => (
  new Promise((resolve, reject) => {
    // Set the isLoggedIn attribute of all expired sessions to 0.
    resetLoggedInIfExpired();
    User.findOne({
      where: {
        name: username,
      },
      raw: true,
    }).then((user) => {
      // Not the same session: invalid.
      if (user.sessionId !== sid) resolve(false);

      // IP address changed in same session: invalid (cookie theft detected).
      if (user.lastIpAddress !== ip) resolve(false);

      // Session already expired: invalid.
      if (user.isLoggedIn === 0) resolve(false);

      // In this case, the session is still valid. Refresh it and resolve with true.
      if (user.isLoggedIn === 1) {
        const nowTimeStamp = Date.now();
        const sessionExpires = nowTimeStamp + (30 * 1000); // Valid for 30 seconds.
        setSession(user.id, sid, sessionExpires);
        resolve(true);
      }
    }).catch((err) => {
      reject(err);
    });
  })
);
