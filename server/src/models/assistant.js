'use strict';

const bcrypt = require('bcrypt');

console.log('creating Assistant model');

module.exports = (sequelize, type) => sequelize.define('Assistant', {
  // Create an Assistant model for our Assistants sqlite table.
  // Attributes of each assistant.
  id: {
    type: type.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    // Defaults to STRING(255).
    type: type.STRING,
    allowNull: false,
  },
  password: {
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
  // Hash and salt the password when the instance is created.
  hooks: {
    beforeCreate: (Assistant) => {
      const copy = Assistant;
      copy.password = copy.password && copy.password !== '' ? bcrypt.hashSync(copy.password, 10) : '';
      return copy;
    },
  },
});
