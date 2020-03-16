'use strict';

console.log('creating attendsCourse model');

module.exports = (sequelize, type, userModel, courseModel) => sequelize.define('AttendsCourse', {
  userId: {
    type: type.UUID,
    // Can be null if an existing course does not yet have any attending students.
    allowNull: true,
    references: {
      model: userModel,
      key: 'id',
    },
  },
  courseId: {
    type: type.UUID,
    // Can be null if a student does not currently attend any courses.
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
