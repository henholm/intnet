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

exports.Assistant = Assistant;
exports.TimeSlot = TimeSlot;

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
// TODO: make async.
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
        console.log('Error in selectTimeSlotByAssistantId in selectTimeSlotsByAssistantName');
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
    User.findOne({
      where: {
        name: userName,
      },
      raw: true,
    }).then((user) => {
      if (!user) {
        resolve(false);
      }
      const hashedTruePassword = user.password;
      bcrypt.compare(userPassword, hashedTruePassword).then((res) => {
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

// Add a new TimeSlot for the Assistant specified by the input name.
exports.addTimeSlot = (assistantName, time) => (
  new Promise((resolve, reject) => {
    console.log(assistantName);
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
