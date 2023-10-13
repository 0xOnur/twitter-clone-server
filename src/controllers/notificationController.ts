import Notification from "../schemas/notification.schema";
import { io } from "../sockets/socket";
import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Response } from "express";

const broadcastNotification = (userId: string, notification: INotification) => {
  io.to(userId).emit("getNotification", notification);
}

// Create Notification
export const createNotification = async (notificationData: INotification) => {
  const newNotification = new Notification(notificationData);
  try {
    const savedNotification = await newNotification.save();
    broadcastNotification(savedNotification.receiver.toString(), savedNotification);

    return savedNotification;
  } catch (error) {
    throw error;
  }
};

// Get User Notifications
export const getNotifications = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "username displayName avatar")
      .populate("receiver", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Find the total number of user documents in the database
    const totalItems = await Notification.countDocuments({ receiver: userId });
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response object
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: notifications,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Notification as Read
export const markNotificationAsRead = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
