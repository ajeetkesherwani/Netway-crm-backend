const mongoose = require("mongoose");

const loginOtpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  mobileSentTo: {
    type: String,
    required: true,
  },
  cleanUser: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  loginKey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

loginOtpSchema.index(
  { loginKey: 1 },
  {
    unique: true,
    partialFilterExpression: { loginKey: { $type: "string" } },
  },
);

let collectionPreparation;
loginOtpSchema.statics.prepareCollection = function () {
  if (!collectionPreparation) {
    collectionPreparation = (async () => {
      await this.init();

      const indexes = await this.collection.indexes();
      for (const index of indexes) {
        if (index.expireAfterSeconds !== undefined) {
          await this.collection.dropIndex(index.name);
        }
      }
    })().catch((error) => {
      collectionPreparation = null;
      throw error;
    });
  }

  return collectionPreparation;
};

module.exports = mongoose.model("LoginOtp", loginOtpSchema);
