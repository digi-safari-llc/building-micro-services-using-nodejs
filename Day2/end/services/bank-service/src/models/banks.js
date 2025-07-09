const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    minLoanAmount: {
      type: Number,
      required: true,
    },
    maxLoanAmount: {
      type: Number,
      required: true,
    },
    minInterestRate: {
      type: Number,
      required: true,
    },
    maxInterestRate: {
      type: Number,
      required: true,
    },
    minCreditScore: {
      type: Number,
      required: true,
    },
    termLength: {
      type: Number,
      required: true,
    },
    processingFee: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

bankSchema.pre("save", async function (done) {
  // logic here

  done();
});

bankSchema.statics.build = (attrs) => {
  return new Bank(attrs);
};

const Bank = mongoose.model("Bank", bankSchema);

module.exports = { Bank };
