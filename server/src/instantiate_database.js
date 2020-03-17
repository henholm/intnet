// This file is used to instantiate our sqlite3 database.

'use strict';

const path = require('path');
// const { Sequelize, Model, DataTypes } = require('sequelize');
// const AssistantModel = require('./models/assistant');
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
// const Assistant = AssistantModel(sequelize, Sequelize);
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

// Force drop tables and re-instantiate them.
(async () => {
  await sequelize.sync({ force: true }).then(() => {
    console.log('All models were synchronized successfully.');
  }).catch((err) => {
    console.log(err);
  });

  // Populate tables. The create method combines build() and save().
  console.log('Populating Users table');
  await User.create(
    {
      name: 'assistant1',
      password: 'password1',
      isAdmin: 0,
      isAssistant: 1,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'assistant2',
      password: 'password2',
      isAdmin: 0,
      isAssistant: 1,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'assistant3',
      password: 'password3',
      isAdmin: 0,
      isAssistant: 1,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'student1',
      password: 'password1',
      isAdmin: 0,
      isAssistant: 0,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'student2',
      password: 'password2',
      isAdmin: 0,
      isAssistant: 0,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'student3',
      password: 'password3',
      isAdmin: 0,
      isAssistant: 0,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );
  await User.create(
    {
      name: 'admin1',
      password: 'password1',
      isAdmin: 1,
      isAssistant: 0,
      isLoggedIn: 0,
      sessionId: null,
      sessionExpires: null,
      lastIpAddress: null,
    },
  );

  await Course.create(
    {
      name: 'course1',
    }
  );
  await Course.create(
    {
      name: 'course2',
    }
  );
  await Course.create(
    {
      name: 'course3',
    }
  );

  /* eslint-disable object-curly-newline */
  await AssistsCourse.create({ userId: 1, courseId: 1 }); // Assistant 1
  await AssistsCourse.create({ userId: 1, courseId: 2 }); // Assistant 1
  await AssistsCourse.create({ userId: 2, courseId: 1 }); // Assistant 2
  await AssistsCourse.create({ userId: 2, courseId: 3 }); // Assistant 2
  await AssistsCourse.create({ userId: 3, courseId: 2 }); // Assistant 3
  await AssistsCourse.create({ userId: 3, courseId: 3 }); // Assistant 3

  await AttendsCourse.create({ userId: 1, courseId: 3 }); // Assistant 1
  await AttendsCourse.create({ userId: 2, courseId: 2 }); // Assistant 2
  await AttendsCourse.create({ userId: 3, courseId: 1 }); // Assistant 3
  await AttendsCourse.create({ userId: 4, courseId: 1 }); // Student 1
  await AttendsCourse.create({ userId: 4, courseId: 2 }); // Student 1
  await AttendsCourse.create({ userId: 4, courseId: 3 }); // Student 1
  await AttendsCourse.create({ userId: 5, courseId: 1 }); // Student 2
  await AttendsCourse.create({ userId: 5, courseId: 2 }); // Student 2
  await AttendsCourse.create({ userId: 6, courseId: 3 }); // Student 3
  /* eslint-enable object-curly-newline */

  await TimeSlot.create(
    {
      userId: 1,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:00 - 13:20',
    }
  );
  await TimeSlot.create(
    {
      userId: 1,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:20 - 13:40',
    }
  );
  await TimeSlot.create(
    {
      userId: 1,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:40 - 14:00'
    }
  );
  await TimeSlot.create(
    {
      userId: 2,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:00 - 13:20'
    }
  );
  await TimeSlot.create(
    {
      userId: 2,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:20 - 13:40'
    }
  );
  await TimeSlot.create(
    {
      userId: 2,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:40 - 14:00'
    }
  );
  await TimeSlot.create(
    {
      userId: 3,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:00 - 13:20'
    }
  );
  await TimeSlot.create(
    {
      userId: 3,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:20 - 13:40'
    }
  );
  await TimeSlot.create(
    {
      userId: 3,
      isReserved: 0,
      isBooked: 0,
      bookedBy: null,
      time: '13:40 - 14:00'
    }
  );
})();
