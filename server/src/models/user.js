'use strict';

const bcrypt = require('bcrypt');

console.log('creating User model');

module.exports = (sequelize, type) => sequelize.define('User', {
  // Create a User model for our Users sqlite table.
  // Attributes of each user.
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
  // Emulates a boolean. It will take values of either 1 or 0.
  isAssistant: {
    type: type.INTEGER,
    allowNull: false,
  },
  // Emulates a boolean. It will take values of either 1 or 0.
  isLoggedIn: {
    type: type.INTEGER,
    allowNull: false,
  },
  sessionId: {
    type: type.STRING,
    allowNull: true,
  },
  sessionExpires: {
    type: type.INTEGER,
    allowNull: true,
  },
  lastIpAddress: {
    type: type.STRING,
    allowNull: true,
  },
}, {
  // Additional settings for the Users table in our sqlite database.
  // Skip timestamp attributes updatedAt and createdAt.
  timestamps: false,
  // Converts camelCase to under_score in the database.
  underscored: true,
  // The table name will automatically be pluralized to 'Users'.
  modelName: 'User',
  // Hash and salt the password when the instance is created.
  hooks: {
    beforeCreate: (User) => {
      const copy = User;
      copy.password = copy.password && copy.password !== '' ? bcrypt.hashSync(copy.password, 10) : '';
      return copy;
    },
  },
});
