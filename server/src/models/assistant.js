'use strict';

console.log('creating Assistant model');

module.exports = (sequelize, type) => sequelize.define('Assistant', {
  // Create an Assistant model for our Assistants sqlite table.
  // Attributes of each assistant.
  id: {
    type: type.INTEGER,
    primaryKey: true,
  },
  name: {
    // Defaults to STRING(255).
    type: type.STRING,
    allowNull: false,
  },
}, {
  // Other settings for the Assistants table in our sqlite database.
  // Skip timestamp attributes updatedAt and createdAt.
  timestamps: false,
  // Converts camelCase to under_score in the database.
  underscored: true,
  // The table name will automatically be pluralized to 'Assistants'.
  modelName: 'Assistant',
});
