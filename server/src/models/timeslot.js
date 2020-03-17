'use strict';

console.log('creating TimeSlot model');

module.exports = (sequelize, type, userModel) => sequelize.define('TimeSlot', {
  // Previously called "assistantId".
  userId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
      model: userModel,
      key: 'id',
    },
  },
  // Emulates a boolean. It will take values of either 1 or 0.
  isReserved: {
    type: type.INTEGER,
    allowNull: false,
  },
  reservedBy: {
    type: type.STRING,
    allowNull: true,
  },
  // Emulates a boolean. It will take values of either 1 or 0.
  isBooked: {
    type: type.INTEGER,
    allowNull: false,
  },
  bookedBy: {
    type: type.STRING,
    allowNull: true,
  },
  time: {
    type: type.STRING,
    allowNull: false,
  },
  courseName: {
    type: type.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
  underscored: true,
  modelName: 'TimeSlot',
});
