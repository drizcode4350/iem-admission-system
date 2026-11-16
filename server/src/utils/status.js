
// Admission application status workflow

const STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Accepted',
  'Rejected'
];

const ADMIN_TRANSITIONS = {
  'Submitted': ['Under Review'],
  'Under Review': ['Accepted', 'Rejected'],
  'Accepted': [],
  'Rejected': [],
};

function allowedNext(status) {
  return ADMIN_TRANSITIONS[status] || [];
}

function canTransition(from, to) {
  return allowedNext(from).includes(to);
}

module.exports = {
  STATUSES,
  ADMIN_TRANSITIONS,
  allowedNext,
  canTransition
};
