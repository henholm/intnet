Add courses

Assistants can have privileges over one or several courses

Student can attend one or more courses

Add an admin role

Admins can grant or revoke assistant privileges to students

Admins can create and remove courses


Users
- userId, name, isAdmin, isAssistant,
(if the project were bigger, it would be widely better to have separate Admin(s)
and Assistant(s) tables instead of a simple boolean attribute)

Courses
- courseId, name, assistantId, adminId
