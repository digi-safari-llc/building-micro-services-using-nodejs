const { Notification } = require("../models/notification");

const loanCreated = async (msg, channel) => {
  try {
    console.log("\n[New Log]:");

    const eventData = JSON.parse(msg.content.toString());

    console.log("Received loan created event.");

    const { loan } = eventData;

    const existingNotification = await Notification.findOne({
      loanId: loan.id,
      type: "loan_created",
      role: "manager",
    });

    if (existingNotification) {
      console.log("Notification already exists for this loan creation!");
      channel.ack(msg);
      return;
    }

    const notificationData = {
      loanId: loan.id,
      role: "manager",
      type: "loan_created",
      title: "New Loan Application",
      message: "A new loan has been added to review list of loans.",
    };

    const newNotification = new Notification(notificationData);

    console.log("New loan created notification data built!");

    await newNotification.save();

    console.log("New loan created notification saved!");

    channel.ack(msg);
  } catch (err) {
    console.log("Error processing loan created event:", err);

    channel.nack(msg, false, true);
  }
};

module.exports = loanCreated;
