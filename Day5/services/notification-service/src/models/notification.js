const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: function () {
        return this.role === "customer";
      },
    },
    loanId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["manager", "customer"],
    },
    type: {
      type: String,
      required: true,
      enum: ["loan_approved", "loan_rejected", "loan_created"],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

notificationSchema.statics.build = (attrs) => {
  return new Notification(attrs);
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
