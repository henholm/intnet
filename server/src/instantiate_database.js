// This file is used to instantiate our sqlite3 database.

'use strict';

const path = require('path');
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

// Force drop Assistants and TimeSlots tables and re-instantiate them.
(async () => {
  await sequelize.sync({ force: true });
  console.log('All models were synchronized successfully.');

  // Populate tables. The create method combines build() and save().
  await User.create({ name: 'assistant1', password: 'password1', isAssistant: 1, isLoggedIn: 0 });
  await User.create({ name: 'assistant2', password: 'password2', isAssistant: 1, isLoggedIn: 0 });
  await User.create({ name: 'assistant3', password: 'password3', isAssistant: 1, isLoggedIn: 0 });
  await User.create({ name: 'student1', password: 'password1', isAssistant: 0, isLoggedIn: 0 });
  await User.create({ name: 'student2', password: 'password2', isAssistant: 0, isLoggedIn: 0 });
  await User.create({ name: 'student3', password: 'password3', isAssistant: 0, isLoggedIn: 0 });

  await Assistant.create({ id: 1, name: 'assistant1' });
  await Assistant.create({ id: 2, name: 'assistant2' });
  await Assistant.create({ id: 3, name: 'assistant3' });

  await TimeSlot.create({ assistantId: 1, bookedBy: 'no one', time: '13:00 - 13:20' });
  await TimeSlot.create({ assistantId: 1, bookedBy: 'no one', time: '13:20 - 13:40' });
  await TimeSlot.create({ assistantId: 1, bookedBy: 'no one', time: '13:40 - 14:00' });
  await TimeSlot.create({ assistantId: 2, bookedBy: 'no one', time: '13:00 - 13:20' });
  await TimeSlot.create({ assistantId: 2, bookedBy: 'no one', time: '13:20 - 13:40' });
  await TimeSlot.create({ assistantId: 2, bookedBy: 'no one', time: '13:40 - 14:00' });
  await TimeSlot.create({ assistantId: 3, bookedBy: 'no one', time: '13:00 - 13:20' });
  await TimeSlot.create({ assistantId: 3, bookedBy: 'no one', time: '13:20 - 13:40' });
  await TimeSlot.create({ assistantId: 3, bookedBy: 'no one', time: '13:40 - 14:00' });
  // console.log(timeSlot33.toJSON());
})();
