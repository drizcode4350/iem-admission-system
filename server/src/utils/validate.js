// Server-side validation is the source of truth (FR-10). Returns { field: message }.
function validateApplication(a, { full = false } = {}) {
  const e = {};
  const need = (f, label) => { if (full && (a[f] === undefined || a[f] === null || a[f] === '')) e[f] = `${label} is required`; };
  need('fullName', 'Full name'); need('dob', 'Date of birth'); need('phone', 'Phone');
  need('address', 'Address'); need('courseId', 'Course'); need('percent10', '10th %');
  need('percent12', '12th %'); need('iemjeeRank', 'IEMJEE rank');
  if (a.fullName && String(a.fullName).trim().length < 3) e.fullName = 'Full name must be at least 3 characters';
  if (a.phone && !/^[6-9]\d{9}$/.test(String(a.phone))) e.phone = 'Phone must be a valid 10-digit Indian mobile number';
  if (a.dob) {
    const d = new Date(a.dob);
    if (isNaN(d)) e.dob = 'Invalid date';
    else { const age = (Date.now() - d) / 3.15576e10; if (age < 15 || age > 30) e.dob = 'Applicant age must be between 15 and 30'; }
  }
  for (const f of ['percent10', 'percent12']) {
    if (a[f] !== undefined && a[f] !== null && a[f] !== '') {
      const n = Number(a[f]); if (isNaN(n) || n < 0 || n > 100) e[f] = 'Percentage must be between 0 and 100';
    }
  }
  if (a.iemjeeRank !== undefined && a.iemjeeRank !== null && a.iemjeeRank !== '') {
    const r = Number(a.iemjeeRank); if (!Number.isInteger(r) || r < 1) e.iemjeeRank = 'Rank must be a positive whole number';
  }
  if (a.address && String(a.address).length > 500) e.address = 'Address too long';
  return e;
}
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
module.exports = { validateApplication, PASSWORD_RE };
