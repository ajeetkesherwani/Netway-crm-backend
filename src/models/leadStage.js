const mongoose = require("mongoose");

const leadStageSchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      required: [true, "Lead stage name is required"],
      trim: true,
      unique: true,
    },
    sortOrder: {
      type: Number,
      required: [true, "Sort order is required"],
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LeadStage || mongoose.model("LeadStage", leadStageSchema);
