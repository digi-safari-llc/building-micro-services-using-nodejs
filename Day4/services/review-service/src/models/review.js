const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    updatedUserData: {
      name: {
        type: String,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
      profileURL: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"],
      },
      customGender: {
        type: String,
        required: false,
      },
      employer: {
        type: String,
        required: true,
      },
      monthlySalary: {
        type: Number,
        required: true,
      },
      creditScore: {
        type: Number,
        required: true,
        min: 300,
        max: 900,
      },
    },
    bankId: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    bankLogo: {
      type: String,
      required: true,
    },
    appliedLoanAmount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    termLength: {
      type: Number,
      required: true,
    },
    dateOfApplication: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
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

reviewSchema.statics.build = (attrs) => {
  return new Review(attrs);
};

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
