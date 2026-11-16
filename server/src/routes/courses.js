const router = require('express').Router();
const Course = require('../models/Course');
const { requireAuth } = require('../middleware/auth');
router.get('/', requireAuth, async (_req, res) => res.json(await Course.find({ isOpen: true }).sort('courseName')));
module.exports = router;
