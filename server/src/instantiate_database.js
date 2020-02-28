// This file is used to instantiate our sqlite3 database.

'use strict';

const path = require('path');
// const { Sequelize, Model, DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');
const AssistantModel = require('./models/assistant');
const TimeSlotModel = require('./models/timeslot');

const databasePath = path.join(__dirname, 'db.sqlite');

// Might need to change to 'database_name', 'root', 'root' or whatever.
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
const Assistant = AssistantModel(sequelize, Sequelize);
const TimeSlot = TimeSlotModel(sequelize, Sequelize, Assistant);

// One Assistant has potentially several TimeSlots.
Assistant.hasMany(TimeSlot);
// Relate TimeSlots table to Assistants table using foreign key 'assistantId'.
// TODO: Make sure this leads to the desired behavior.
TimeSlot.belongsTo(Assistant, { foreignKey: 'assistantId' });

// Force drop Assistants and TimeSlots tables and re-instantiate them.
(async () => {
  await sequelize.sync({ force: true });
  console.log('All models were synchronized successfully.');

  // Populate tables. The create method combines build() and save().
  await Assistant.create({ name: 'assistant1', password: 'password1' });
  await Assistant.create({ name: 'assistant2', password: 'password2' });
  await Assistant.create({ name: 'assistant3', password: 'password3' });

  // Change bookedBy to null after making sure it works.
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
