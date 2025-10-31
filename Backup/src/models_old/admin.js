const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    image: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true, match: /^[0-9]{10}$/ },
    password: { type: String, required: true },
    resetOtpExpires: { type: String, required: false },
    address: { type: String, required: false },
    resetOtpExpires: { type: Date },
    bio: { type: String, required: false },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash the password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
