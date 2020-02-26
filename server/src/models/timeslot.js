'use strict';

console.log('creating TimeSlot model');

// Create a TimeSlot model for our TimeSlots sqlite table.
module.exports = (sequelize, type, assistantModel) => sequelize.define('TimeSlot', {
  // Attributes of each TimeSlot. Might need to rename the ID-attribute.
  id: {
    type: type.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  assistantId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
      model: assistantModel,
      key: 'id',
    },
  },
  bookedBy: {
    type: type.STRING,
    allowNull: true,
  },
  time: type.STRING,
}, {
  timestamps: false,
  underscored: true,
  modelName: 'TimeSlot',
});
