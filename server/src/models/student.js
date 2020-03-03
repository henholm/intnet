'use strict';

const bcrypt = require('bcrypt');

console.log('creating Student model');

module.exports = (sequelize, type) => sequelize.define('Student', {
  // Create a Student model for our Students sqlite table.
  // Attributes of each student.
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
}, {
  // Other settings for the Assistants table in our sqlite database.
  // Skip timestamp attributes updatedAt and createdAt.
  timestamps: false,
  // Converts camelCase to under_score in the database.
  underscored: true,
  // The table name will automatically be pluralized to 'Students'.
  modelName: 'Student',
  // Hash and salt the password when the instance is created.
  hooks: {
    beforeCreate: (Student) => {
      const copy = Student;
      copy.password = copy.password && copy.password !== '' ? bcrypt.hashSync(copy.password, 10) : '';
      return copy;
    },
  },
});
