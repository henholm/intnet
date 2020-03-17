'use strict';

console.log('creating Course model');

module.exports = (sequelize, type) => sequelize.define('Course', {
  name: {
    // Defaults to STRING(255).
    type: type.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,
  underscored: true,
  modelName: 'Course',
});
