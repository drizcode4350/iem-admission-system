// Module 4 — Admin Dashboard using MongoDB aggregation ($match + $group), FR-31/32.
// SQL equivalent: SELECT status, COUNT(*) FROM applications WHERE status <> 'Draft' GROUP BY status;
const router = require('express').Router();
const Application = require('../models/Application');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/summary', requireAuth, requireRole('admin', 'director'), async (_req, res) => {
  const [result] = await Application.aggregate([
    { $match: { status: { $ne: 'Draft' } } },
    { $facet: {
      total: [{ $count: 'n' }],
      byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
      byCourse: [
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, course: '$course.courseName', department: '$course.department', count: 1 } },
        { $sort: { count: -1 } },
      ],
      byDepartmentStatus: [
        { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'c' } },
        { $unwind: '$c' },
        { $group: { _id: { department: '$c.department', status: '$status' }, count: { $sum: 1 } } },
        { $project: { _id: 0, department: '$_id.department', status: '$_id.status', count: 1 } },
        { $sort: { department: 1, status: 1 } },
      ],
    } },
  ]);
  res.json({
    total: result.total[0]?.n || 0,
    byStatus: result.byStatus.map((s) => ({ status: s._id, count: s.count })),
    byCourse: result.byCourse,
    byDepartmentStatus: result.byDepartmentStatus,
  });
});
module.exports = router;
