const { BadRequestError } = require("../errors/bad-request-error");
const { NotFoundError } = require("../errors/not-found-error");
const { Notification } = require("../models/notification");
const logger = require("../utils/logger");

const markNotificationRead = async (req, res) => {
  const requestId = Date.now().toString();
  const { isRead } = req.query;
  const notificationId = req.params.id;
  const { role, id: currentUserId } = req.currentUser;

  logger.info(`[${requestId}] Starting mark notification as read process`, {
    endpoint: "/api/notifications/read/:id",
    method: "PUT",
    notificationId,
    userId: currentUserId,
    userRole: role,
    requestId,
  });

  if (!currentUserId) {
    logger.warn(
      `[${requestId}] Authentication required for marking notification`,
      {
        notificationId,
        requestId,
      }
    );
    throw new BadRequestError("Authentication required");
  }

  if (role !== "customer" && role !== "manager") {
    logger.warn(`[${requestId}] Invalid role for marking notification`, {
      role,
      userId: currentUserId,
      notificationId,
      requestId,
    });
    throw new BadRequestError(
      "Only customers and managers can mark notifications as read"
    );
  }

  logger.debug(`[${requestId}] Initial validation completed`, {
    notificationId,
    userId: currentUserId,
    userRole: role,
    requestId,
  });

  try {
    logger.debug(`[${requestId}] Fetching notification from database`, {
      notificationId,
      requestId,
    });

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.warn(`[${requestId}] Notification not found`, {
        notificationId,
        userId: currentUserId,
        requestId,
      });
      throw new NotFoundError("Notification not found!");
    }

    logger.debug(`[${requestId}] Notification found, checking permissions`, {
      notificationId,
      notificationRole: notification.role,
      notificationUserId: notification.userid,
      currentUserId,
      currentUserRole: role,
      requestId,
    });

    // Check permissions
    let hasPermission = false;
    if (notification.role === "manager" && role === "manager") {
      hasPermission = true;
    } else if (notification.userid === currentUserId) {
      hasPermission = true;
    }

    if (!hasPermission) {
      logger.warn(
        `[${requestId}] Unauthorized attempt to mark notification as read`,
        {
          notificationId,
          notificationRole: notification.role,
          notificationUserId: notification.userid,
          currentUserId,
          currentUserRole: role,
          requestId,
        }
      );
      throw new BadRequestError(
        "You can only mark your own notifications as read"
      );
    }

    if (notification.isRead) {
      logger.info(`[${requestId}] Notification already marked as read`, {
        notificationId,
        userId: currentUserId,
        requestId,
      });
      return res.status(200).send({
        success: [{ message: "Notification is already marked as read!" }],
        notification,
      });
    }

    logger.debug(`[${requestId}] Marking notification as read`, {
      notificationId,
      userId: currentUserId,
      requestId,
    });

    notification.isRead = true;
    await notification.save();

    logger.info(`[${requestId}] Notification marked as read successfully`, {
      notificationId,
      userId: currentUserId,
      userRole: role,
      requestId,
    });

    res.status(200).send({
      success: [{ message: "Notification marked as read successfully!" }],
      notification,
    });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }

    logger.error(`[${requestId}] Error marking notification as read`, {
      error: error.message,
      stack: error.stack,
      notificationId,
      userId: currentUserId,
      requestId,
    });
    throw error;
  }
};

module.exports = markNotificationRead;
