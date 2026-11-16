// FR-5: admin & director accounts are created by seeding only.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const courses = [
    ['B.Tech Computer Science & Engineering', 'CSE', 120],
    ['B.Tech Information Technology', 'IT', 60],
    ['B.Tech Electronics & Communication', 'ECE', 60],
    ['B.Tech Electrical Engineering', 'EE', 60],
    ['B.Tech Mechanical Engineering', 'ME', 60],
    ['BCA', 'Computer Applications', 60],
  ];
  for (const [courseName, department, seats] of courses)
    await Course.updateOne({ courseName }, { courseName, department, seats, isOpen: true }, { upsert: true });
  const staff = [
    ['admin@iem.edu.in', 'Admin@1234', 'admin', 'Admissions Officer'],
    ['director@iem.edu.in', 'Director@1234', 'director', 'Director'],
  ];
  for (const [email, pw, role, fullName] of staff)
    await User.updateOne({ email }, { email, role, fullName, passwordHash: await bcrypt.hash(pw, 10) }, { upsert: true });
  console.log('Seeded courses, admin@iem.edu.in / Admin@1234, director@iem.edu.in / Director@1234');
  await mongoose.disconnect();
})();
