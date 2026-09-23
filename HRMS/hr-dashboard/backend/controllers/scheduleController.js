exports.getSchedule = async (req, res) => {
  res.json({ schedules: [{ start: '2025-12-14', end: '2025-12-20', shift: '9AM-6PM' }] });
};