const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Notification } = require("../models/notification");
const logger = require("../utils/logger");

const getAllNotifications = async (req, res) => {
  const requestId = Date.now().toString();

  const { role, id: currentUserId } = req.currentUser;

  logger.info(`[${requestId}] Starting notification retrieval`, {
    endpoint: "/api/notifications/all",
    method: "GET",
    userId: currentUserId,
    userRole: role,
    requestId,
  });

  try {
    let filter = {};

    if (role === "customer") {
      filter.userid = currentUserId;
      logger.debug(`[${requestId}] Filtering notifications for customer`, {
        userId: currentUserId,
        filter,
        requestId,
      });
    } else if (role === "manager") {
      filter.role = "manager";
      logger.debug(`[${requestId}] Filtering notifications for manager`, {
        filter,
        requestId,
      });
    } else {
      logger.warn(`[${requestId}] Invalid user role provided`, {
        role,
        userId: currentUserId,
        requestId,
      });
      throw new BadRequestError("Invalid user role!");
    }

    logger.debug(`[${requestId}] Fetching notifications from database`, {
      filter,
      requestId,
    });

    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    logger.info(`[${requestId}] Successfully retrieved notifications`, {
      totalCount: notifications.length,
      unreadCount,
      userId: currentUserId,
      userRole: role,
      requestId,
    });

    res.status(200).send({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(
        `[${requestId}] Bad request error in notification retrieval`,
        {
          error: error.message,
          userId: currentUserId,
          userRole: role,
          requestId,
        }
      );
      throw error;
    }

    logger.error(`[${requestId}] Error fetching notifications`, {
      error: error.message,
      stack: error.stack,
      userId: currentUserId,
      userRole: role,
      requestId,
    });
    throw new DatabaseConnectionError();
  }
};

module.exports = getAllNotifications;
