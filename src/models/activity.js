const mongoose = require("mongoose");
const { Schema } = mongoose;

const logsSchema = new Schema(
  {
    createdById: {
      type: Schema.Types.ObjectId,
      required: true,
     refPath: "createdByRole"
    },

    createdByRole: {
      type: String,
      enum: ["Admin", "Staff", "Reseller", "Lco", "User"],
      required: true
    },
    action: {
      type: String,
    },
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true 
  }
);

const Logs = mongoose.model("Logs", logsSchema);

module.exports = Logs;


