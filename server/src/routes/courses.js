const router = require('express').Router();
const Course = require('../models/Course');

router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find({ isOpen: true }).sort('courseName');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

module.exports = router;