const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave", "Holiday", "Pending"],
      default: "Absent",
    },
    checkInLocation: {
      lat: { type: String, default: null },
      long: { type: String, default: null },
    },
    checkOutLocation: {
      lat: { type: String, default: null },
      long: { type: String, default: null },
    },
    adminNotes: {
      type: String,
      default: "",
    },
    isEditedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per staff per day
AttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = Attendance;
