const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date,
  shift: String,
});

module.exports = mongoose.model('Schedule', scheduleSchema);