
Assistants can have privileges over one or several courses. This allows them to
  (1) offer time slots for that course
  (2) remove their time slots for that course

Students can attend one or more courses. This grants them the privilege to
  (1) see time slots for that course
  (2) book time slots for that course

Add an admin role
  (1) admins can add new courses (provided no course with that name exists)
  (2) remove courses (this automatically removes time slots for that course)
  (3) grant assistant privileges
  (4) revoke assistant privileges (this has to also remove that assistant's time
      slot for the course where the privilege is revoked)

Users
- userId, name, password, isAdmin, isAssistant, isLoggedIn, sessionId,
  sessionExpires, lastIpAddress

Courses
- courseId, name, assistantId, adminId

AssistsCourse
- assistantId, courseId

AttendsCourse
- studentId, courseId

TimeSlots
- timeSlotId, assistantId (foreignKey), isReserved, isBooked, bookedBy, time,
  courseName

Login -> Courses, either Administers or Assists/Attends or Attends
Courses/courseName/timeSlots


Student -> Courses
Assistant -> Courses
Admin -> two buttons
  (1) Courses (add and remove courses)
  (2) Privileges (grant and revoke privileges)
