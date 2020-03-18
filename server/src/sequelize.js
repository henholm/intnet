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

// One Course potentially has several TimeSlots (or none).
Course.hasMany(TimeSlot);
TimeSlot.belongsTo(Course, { foreignKey: 'courseName', targetKey: 'name', onDelete: 'CASCADE' });

// One Assistant (who is a User) potentially assists several Course (or none).
AssistsCourse.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
User.hasMany(AssistsCourse);

// One Course is potentially assisted by several Assistants (or none).
AssistsCourse.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id', onDelete: 'CASCADE' });
Course.hasMany(AssistsCourse);

// A student (who is a User) potentially attends several Course (or none).
AttendsCourse.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
User.hasMany(AttendsCourse);

// One Course is potentially attended by several Students (or none).
AttendsCourse.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id', onDelete: 'CASCADE' });
Course.hasMany(AttendsCourse);

exports.User = User;
exports.Course = Course;
exports.AssistsCourse = AssistsCourse;
exports.AttendsCourse = AttendsCourse;
exports.TimeSlot = TimeSlot;

// Function for toggling the isLoggedIn attribute of a user.
function setLoggedIn(userId, toggleTo) {
  return new Promise((resolve, reject) => {
    User.update(
      { isLoggedIn: toggleTo },
      { where: { id: userId } },
    ).then((numUpdatedRows) => {
      resolve(numUpdatedRows);
    }).catch((err) => {
      reject(err);
    });
  });
}

function resetReservedTimeSlots() {
  TimeSlot.update(
    { isReserved: 0, reservedBy: null },
    { where: { isReserved: 1 } },
  )
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
  User.update(
    {
      sessionId: sid,
      sessionExpires,
      lastIpAddress: ip,
    },
    { where: { id: userId } },
  )
}

exports.setLoggedIn = setLoggedIn;
exports.resetLoggedInIfExpired = resetLoggedInIfExpired;

exports.setTimeSlotAttributes = (timeSlotId, isReserved, reservedBy, isBooked, bookedBy) => (
  TimeSlot.update(
    {
      isReserved,
      reservedBy,
      isBooked,
      bookedBy,
    },
    { returning: true, where: { id: timeSlotId } },
  )
);

// SELECT * FROM time_slots INNER JOIN users ON time_slots.user_id == users.id;
// Removes sensitive data like passwords.
exports.selectAllTimeSlotsClean = () => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      include: [{
        model: Course,
        required: true,
      }, {
        model: User,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlots) => {
      const cleanTimeSlots = [];
      for (let i = 0; i < dirtyTimeSlots.length; i += 1) {
        const dirtyTimeSlot = dirtyTimeSlots[i];
        const cleanTimeSlot = {
          id: dirtyTimeSlot.id,
          isReserved: dirtyTimeSlot.isReserved,
          reservedBy: dirtyTimeSlot.reservedBy,
          isBooked: dirtyTimeSlot.isBooked,
          bookedBy: dirtyTimeSlot.bookedBy,
          time: dirtyTimeSlot.time,
          assistantId: dirtyTimeSlot['User.id'],
          assistantName: dirtyTimeSlot['User.name'],
          courseName: dirtyTimeSlot.courseName,
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
);

// Selects time slot as specified by input timeslot id. Inner join with User.
exports.selectTimeSlotByIdClean = (timeSlotId, reservedBy) => (
  new Promise((resolve, reject) => {
    TimeSlot.findOne({
      where: {
        id: timeSlotId,
      },
      include: [{
        model: Course,
        required: true,
      }, {
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
        courseName: dirtyTimeSlot['Course.name'],
      };
      if (dirtyTimeSlot.reservedBy !== null && dirtyTimeSlot.reservedBy !== reservedBy) {
        reject();
      }
      resolve(cleanTimeSlot);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.selectUserIdFromName = (username) => (
  new Promise((resolve, reject) => {
    User.findOne({
      where: {
        name: username,
      },
    }).then((user) => {
      resolve(user.id);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getCourses = () => (
  new Promise((resolve, reject) => {
    Course.findAll({ raw: true }).then((courses) => {
      resolve(courses);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getUsers = () => (
  new Promise((resolve, reject) => {
    User.findAll({ raw: true }).then((dirtyUsers) =>
    {
      const cleanUsers = [];
      for (let i = 0; i < dirtyUsers.length; i += 1) {
        const dirtyUser = dirtyUsers[i];
        const cleanUser = {
          id: dirtyUser.id,
          name: dirtyUser.name,
          isAssistant: dirtyUser.isAssistant,
          isAdmin: dirtyUser.isAdmin,
        };
        cleanUsers.push(cleanUser);
      }
      resolve(cleanUsers);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getAdmins = () => (
  new Promise((resolve, reject) => {
    User.findAll({
      where: { isAdmin: 1 },
      raw: true,
    }).then((dirtyUsers) => {
      const cleanUsers = [];
      for (let i = 0; i < dirtyUsers.length; i += 1) {
        const dirtyUser = dirtyUsers[i];
        const cleanUser = {
          id: dirtyUser.id,
          name: dirtyUser.name,
          isAssistant: dirtyUser.isAssistant,
          isAdmin: dirtyUser.isAdmin,
        };
        cleanUsers.push(cleanUser);
      }
      resolve(cleanUsers);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getStudentsForCourse = (courseName) => (
  new Promise((resolve, reject) => {
    User.findAll({
      include: [{
        model: AttendsCourse,
        required: true,
        include: [{
          model: Course,
          required: true,
          where: { name: courseName },
        }],
      }],
      raw: true,
    }).then((dirtyUsers) => {
      const cleanUsers = [];
      for (let i = 0; i < dirtyUsers.length; i += 1) {
        const dirtyUser = dirtyUsers[i];
        const cleanUser = {
          id: dirtyUser.id,
          name: dirtyUser.name,
          isAssistant: dirtyUser.isAssistant,
          isAdmin: dirtyUser.isAdmin,
        };
        cleanUsers.push(cleanUser);
      }
      resolve(cleanUsers);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getAssistantsForCourse = (courseName) => (
  new Promise((resolve, reject) => {
    User.findAll({
      include: [{
        model: AssistsCourse,
        required: true,
        include: [{
          model: Course,
          required: true,
          where: { name: courseName },
        }],
      }],
      raw: true,
    }).then((dirtyUsers) => {
      const cleanUsers = [];
      for (let i = 0; i < dirtyUsers.length; i += 1) {
        const dirtyUser = dirtyUsers[i];
        const cleanUser = {
          id: dirtyUser.id,
          name: dirtyUser.name,
          isAssistant: dirtyUser.isAssistant,
          isAdmin: dirtyUser.isAdmin,
        };
        cleanUsers.push(cleanUser);
      }
      resolve(cleanUsers);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getAttendingCourses = (userId) => (
  new Promise((resolve, reject) => {
    Course.findAll({
      include: [{
        model: AttendsCourse,
        required: true,
        include: [{
          model: User,
          required: true,
          where: { id: userId },
        }]
      }],
      raw: true,
    }).then((courses) => {
      resolve(courses);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getAssistingCourses = (userId) => (
  new Promise((resolve, reject) => {
    Course.findAll({
      include: [{
        model: AssistsCourse,
        required: true,
        include: [{
          model: User,
          required: true,
          where: { id: userId },
        }]
      }],
      raw: true,
    }).then((courses) => {
      resolve(courses);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getTimeSlotsForCourse = (courseName) => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      include: [{
        model: Course,
        required: true,
        where: { name: courseName },
      }, {
        model: User,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlots) => {
      const cleanTimeSlots = [];
      for (let i = 0; i < dirtyTimeSlots.length; i += 1) {
        const dirtyTimeSlot = dirtyTimeSlots[i];
        const cleanTimeSlot = {
          id: dirtyTimeSlot.id,
          isReserved: dirtyTimeSlot.isReserved,
          reservedBy: dirtyTimeSlot.reservedBy,
          isBooked: dirtyTimeSlot.isBooked,
          bookedBy: dirtyTimeSlot.bookedBy,
          time: dirtyTimeSlot.time,
          assistantId: dirtyTimeSlot['User.id'],
          assistantName: dirtyTimeSlot['User.name'],
          courseName: dirtyTimeSlot.courseName,
        };
        cleanTimeSlots.push(cleanTimeSlot);
      }
      resolve(cleanTimeSlots);
    }).catch((err) => {
      reject(err);
    });
  })
);

exports.getTimeSlotsForAssistant = (username) => (
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      include: [{
        model: Course,
        required: true,
        where: { name: courseName },
      }, {
        model: User,
        required: true,
      }],
      raw: true,
    }).then((dirtyTimeSlots) => {
      const cleanTimeSlots = [];
      for (let i = 0; i < dirtyTimeSlots.length; i += 1) {
        const dirtyTimeSlot = dirtyTimeSlots[i];
        const cleanTimeSlot = {
          id: dirtyTimeSlot.id,
          isReserved: dirtyTimeSlot.isReserved,
          reservedBy: dirtyTimeSlot.reservedBy,
          isBooked: dirtyTimeSlot.isBooked,
          bookedBy: dirtyTimeSlot.bookedBy,
          time: dirtyTimeSlot.time,
          assistantId: dirtyTimeSlot['User.id'],
          assistantName: dirtyTimeSlot['User.name'],
          courseName: dirtyTimeSlot.courseName,
        };
        cleanTimeSlots.push(cleanTimeSlot);
      }
      resolve(cleanTimeSlots);
    }).catch((err) => {
      reject(err);
    });
  })
);

// Selects time slot as specified by input assistant ID. Inner join with User.
exports.selectTimeSlotsByAssistantId = (assistantId) => (
  TimeSlot.findAll({
    where: {
      user_id: assistantId,
    },
    raw: true,
  })
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
  new Promise((resolve, reject) => {
    TimeSlot.findAll({
      where: {
        bookedBy: studentName,
      },
      include: [{
        model: User,
        required: true,
      }],
      raw: true,
    }).then((timeSlots) => {
      console.log('TIME SLOTS');
      console.log(timeSlots);
      const returnTimeSlots = [];
      for (let i = 0; i < timeSlots.length; i += 1) {
        console.log('INSIDE LOOP');
        const timeSlot = timeSlots[i];
        console.log(timeSlot);
        const returnTimeSlot = {
          timeSlotId: timeSlot.id,
          time: timeSlot.time,
          assistantName: timeSlot['User.name'],
        }
        console.log('returnTimeSlot 1');
        console.log(returnTimeSlot);
        returnTimeSlots.push(returnTimeSlot);
      }
      console.log('returnTimeSlots 2');
      console.log(returnTimeSlots);
      resolve(returnTimeSlots);
    }).catch(err => reject(err) );
  })
);

exports.loginAllegedUser = (username, userPassword, sid, ip) => (
  new Promise((resolve, reject) => {
    resetLoggedInIfExpired();
    User.findOne({
      where: {
        name: username,
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
        const sessionExpires = nowTimeStamp + (60 * 60 * 1000); // Valid for 30 seconds.
        if (res && user.isLoggedIn === 1 && user.sessionId !== sid) {
          // Passwords matched, but user is already logged in elsewhere.
          const response = { userData: null, msg: `${username} is already logged in` };
          resolve(response);
        } else if (res && user.isLoggedIn === 1 && user.sessionId === sid) {
          // In this case, simply renew the sessionExpires attribute.
          setSession(user.id, sid, sessionExpires, ip);
          const userData = {
            userId: user.id,
            username: user.name,
            isAssistant: user.isAssistant,
            isAdmin: user.isAdmin,
          };
          const response = { userData, msg: `Successfully renewed session for ${username}` };
          resolve(response);
        } else if (res && user.isLoggedIn !== 1) {
          // Resolve with userData if passwords matched and user is not logged in.
          setLoggedIn(user.id, 1);
          setSession(user.id, sid, sessionExpires, ip);
          const userData = {
            userId: user.id,
            username: user.name,
            isAssistant: user.isAssistant,
            isAdmin: user.isAdmin,
          };
          const response = { userData, msg: `${username} logged in successfully` };
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
exports.addTimeSlot = (assistantName, assistantId, time, course) => (
  new Promise((resolve, reject) => {
    TimeSlot.create({
      userId: assistantId,
      isReserved: 0,
      reservedBy: null,
      isBooked: 0,
      bookedBy: null,
      time,
      courseName: course,
    }).then((newTimeSlot) => {
      resolve(newTimeSlot);
    }).catch((err) => {
      reject(err);
    });
  }).catch((err) => {
    reject(err);
  })
);

// Remove TimeSlot corresponding to the input ID.
exports.removeTimeSlot = (timeSlotId) => (
  TimeSlot.destroy(
    {
      where: { id: timeSlotId },
      force: true,
    },
  ).catch((err) => console.log(err) )
);

exports.addCourse = (courseName) => (
  new Promise((resolve, reject) => {
    Course.create({
      name: courseName,
    }).then((newCourse) => {
      resolve(newCourse);
    }).catch((err) => {
      reject(err);
    });
  }).catch((err) => {
    reject(err);
  })
);

exports.removeCourse = (courseName) => (
  Course.destroy(
    {
      where: { name: courseName },
      force: true,
    },
  ).catch((err) => console.log(err) )
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
        const sessionExpires = nowTimeStamp + (60 * 60 * 1000); // Valid for 30 seconds.
        setSession(user.id, sid, sessionExpires);
        resolve(true);
      }
    }).catch((err) => {
      reject(err);
    });
  })
);
