'use strict';

console.log('creating assistsCourse model');

module.exports = (sequelize, type, userModel, courseModel) => sequelize.define('AssistsCourse', {
  userId: {
    type: type.UUID,
    // Can be null if an existing course does not yet have any assistants.
    allowNull: true,
    references: {
      model: userModel,
      key: 'id',
    },
  },
  courseId: {
    type: type.UUID,
    // Can be null if an assistant has not yet been granted privileges over any
    // courses yet.
    allowNull: true,
    references: {
      model: courseModel,
      key: 'id',
    },
  },
}, {
  timestamps: false,
  underscored: true,
  modelName: 'AssistsCourse',
});
